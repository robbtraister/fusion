'use strict'

const url = require('url')

const request = require('request-promise-native')
const _merge = require('lodash.merge')

const BaseSource = require('./base')

const { RedirectError } = require('../../errors')
const metrics = require('../../metrics')
const timer = require('../../utils/timer')

const { contentBase } = require('../../../environment')

function sanitizeUri (uri) {
  const uriParts = url.parse(uri)
  return (uriParts.auth)
    ? url.format(Object.assign(uriParts, { auth: `${uriParts.auth.split(':').shift()}:<redacted>` }))
    : uri
}

class ResolveSource extends BaseSource {
  async fetchImpl (query, options = {}) {
    const resolution = this.resolve(query, options)
    const response = await this.fetchResolution(resolution, options)

    const { data, statusCode, headers } = response

    if (statusCode >= 400) {
      const error = (data instanceof Object)
        ? data
        : new Error(data)
      error.statusCode = statusCode
      throw error
    }

    const [ redirectStatus, redirectUri ] = (statusCode === 200)
      ? [ 302, headers['pb-canonical-redirect'] ]
      : (statusCode >= 300)
        ? [ statusCode, headers.location ]
        : [ null, null ]

    /* eslint-disable eqeqeq */
    const maxRedirects = (options.followRedirect === false || options.maxRedirects == 0)
    /* eslint-enable eqeqeq */
      ? 0
      : (+options.maxRedirects || 2)

    if (redirectUri) {
      if (maxRedirects <= 0) {
        throw new RedirectError(redirectUri, redirectStatus)
      } else {
        return this.fetchImpl(
          _merge({}, query, data),
          { maxRedirects: maxRedirects - 1 }
        )
      }
    }

    return response
  }

  async fetchResolution ({ query, resolvedUri }, options) {
    let success = false
    const latencyTic = timer.tic()
    try {
      const response = await request({
        uri: resolvedUri,
        followRedirect: false,
        resolveWithFullResponse: true,
        simple: false
      })

      let data = response.body
      const size = +response.headers['content-length'] || data.length

      success = (response.statusCode < 400)
      success && metrics({
        'arc.fusion.content.bytes':
          {
            operation: 'fetch',
            source: this.name,
            value: size
          }
      })

      try {
        data = JSON.parse(data)
      } catch (_) {}

      return {
        data,
        expires: this.getExpiration(),
        headers: response.headers,
        size,
        statusCode: response.statusCode
      }
    } finally {
      metrics({
        'arc.fusion.content.latency':
          {
            operation: 'fetch',
            source: this.name,
            result: success ? 'success' : 'error',
            value: latencyTic.toc()
          }
      })
    }
  }

  resolveQuery (query) {
    return this.config.resolve(query)
  }

  resolve (query /*, options */) {
    const uri = this.resolveQuery(query)
    const resolvedUri = url.resolve(contentBase || '', uri)
    const sanitizedUri = sanitizeUri(resolvedUri)

    return {
      query,
      resolvedUri,
      sanitizedUri
    }
  }
}

module.exports = ResolveSource
