'use strict'

const url = require('url')

const request = require('request-promise-native')

const BaseSource = require('./base')

const debugFetch = require('debug')('fusion:content:sources:fetch')
const debugTimer = require('debug')('fusion:timer:sources:fetch')
const timer = require('../../../timer')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')

const {
  contentBase
} = require('../../../../environment')

function sanitizeUri (uri) {
  const uriParts = url.parse(uri)
  return (uriParts.auth)
    ? url.format(Object.assign(uriParts, { auth: `${uriParts.auth.split(':').shift()}:<redacted>` }))
    : uri
}

class ResolveSource extends BaseSource {
  async fetch (key) {
    const { resolvedUri, sanitizedUri } = this.resolve(key)

    debugFetch(`Fetching from source [${sanitizedUri}]`)
    const tic1 = timer.tic()

    return request({
      uri: resolvedUri,
      json: true
    })
      .then((data) => this.transform(data))
      .then((data) => {
        const elapsedTime = tic1.toc()
        debugTimer(`Fetched from source [${sanitizedUri}]`, elapsedTime)
        const tags = ['operation:fetch', 'result:success', `source:${this.name}`]
        sendMetrics([
          // {type: METRIC_TYPES.CONTENT_RESULT, value: 1, tags},
          { type: METRIC_TYPES.CONTENT_LATENCY, value: elapsedTime, tags },
          { type: METRIC_TYPES.CONTENT_RESULT_SIZE, value: JSON.stringify(data).length, tags }
        ])

        return data
      })
  }

  formatUri (uri) {
    const resolvedUri = url.resolve(contentBase, uri)
    const sanitizedUri = sanitizeUri(resolvedUri)

    return {
      resolvedUri,
      sanitizedUri
    }
  }

  resolve (key) {
    return this.formatUri(this.config.resolve(key))
  }
}

module.exports = ResolveSource
