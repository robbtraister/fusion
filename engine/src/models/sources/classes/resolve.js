'use strict'

const url = require('url')

const request = require('request-promise-native')

const _merge = require('lodash.merge')

const BaseSource = require('./base')

const debugFetch = require('debug')('fusion:content:sources:fetch')
const debugTimer = require('debug')('fusion:timer:sources:fetch')
const timer = require('../../../timer')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')

const { RedirectError } = require('../../../errors')

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
  async _fetch ({ query, resolvedUri, sanitizedUri }, options = {}) {
    debugFetch(`Fetching from source [${sanitizedUri}]`)
    const tic1 = timer.tic()

    const maxRedirects = (options.maxRedirects === 0) ? 0 : (+options.maxRedirects || 10)

    const response = await request({
      uri: resolvedUri,
      json: true,
      followRedirect: false,
      resolveWithFullResponse: true,
      simple: false
    })

    if (response.statusCode >= 400) {
      const err = new Error(response.body)
      err.statusCode = response.statusCode
      throw err
    }

    const [ redirectStatus, redirectUri ] = (response.statusCode === 200)
      ? [ 302, response.headers['pb-canonical-redirect'] ]
      : (response.statusCode >= 300)
        ? [ response.statusCode, response.headers.location ]
        : [ null, null ]

    if (redirectUri) {
      if (options.followRedirect === false || maxRedirects <= 0) {
        throw new RedirectError(redirectUri, redirectStatus)
      } else {
        return this.fetch(
          _merge({}, query, response.body),
          Object.assign({}, options, { maxRedirects: maxRedirects - 1 })
        )
      }
    }

    const data = this.transform(response.body)
    const elapsedTime = tic1.toc()
    debugTimer(`Fetched from source [${sanitizedUri}]`, elapsedTime)
    const tags = ['operation:fetch', 'result:success', `source:${this.name}`]
    sendMetrics([
      // {type: METRIC_TYPES.CONTENT_RESULT, value: 1, tags},
      { type: METRIC_TYPES.CONTENT_LATENCY, value: elapsedTime, tags },
      { type: METRIC_TYPES.CONTENT_RESULT_SIZE, value: JSON.stringify(data).length, tags }
    ])

    return data
  }

  async fetch (query, options = {}) {
    return this._fetch(this.resolve(query, options), options)
  }

  formatUri (uri, options) {
    const resolvedUri = url.resolve(contentBase, uri)
    const sanitizedUri = sanitizeUri(resolvedUri)

    return {
      resolvedUri,
      sanitizedUri
    }
  }

  resolve (query, options) {
    return Object.assign(
      { query },
      this.formatUri(this.config.resolve(query), options)
    )
  }
}

module.exports = ResolveSource
