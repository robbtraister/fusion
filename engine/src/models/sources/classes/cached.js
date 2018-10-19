'use strict'

const crypto = require('crypto')

const request = require('request-promise-native')

const ResolveSource = require('./resolve')

const debugFetch = require('debug')('fusion:content:sources:fetch')
const debugTimer = require('debug')('fusion:timer:sources:fetch')
const timer = require('../../../timer')

const {
  cachePrefix,
  cacheProxyUrl
} = require('../../../../environment')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')

function getCacheKey (uri, options = {}) {
  const followRedirect = options.followRedirect !== false
  const hash = crypto.createHash('sha256').update(uri).digest('hex')
  return `${cachePrefix}:${followRedirect}:${hash}`
}

async function makeCacheRequest ({ method, key, value }) {
  return (cacheProxyUrl)
    ? request(
      Object.assign(
        {
          method: method || 'GET',
          uri: `${cacheProxyUrl}?key=${key}`,
          json: true
        },
        // don't depend on existence of value, since you might want to push null/undefined
        (/^(POST|PUT)$/.test(method))
          ? { body: value }
          : {}
      )
    )
    : Promise.resolve()
}

const clearCacheContent = async (key) => makeCacheRequest({ key, method: 'DELETE' })
const fetchCacheContent = async (key) => makeCacheRequest({ key })
const pushCacheContent = async (key, value) => makeCacheRequest({ key, value, method: 'PUT' })

class CachedSource extends ResolveSource {
  async clear (query) {
    async function clearKey (options) {
      const { cacheKey } = this.resolve(query, options)

      try {
        return await clearCacheContent(cacheKey)
      } catch (err) {
        if (err.response) {
          const responseError = new Error(err.response.body)
          responseError.statusCode = err.response.statusCode
          throw responseError
        }
        throw err
      }
    }

    return Promise.all([
      clearKey({ followRedirect: true }),
      clearKey({ followRedirect: false })
    ])
  }

  async fetch (query, options) {
    try {
      return await this.fetchThroughCache(query, options)
    } catch (err) {
      if (err.response) {
        const responseError = new Error(err.response.body)
        responseError.statusCode = err.response.statusCode
        throw responseError
      }
      throw err
    }
  }

  async fetchThroughCache (query, options = {}) {
    if (!cacheProxyUrl || options.forceUpdate === true) {
      return this.update(query, options)
    }

    const resolution = this.resolve(query, options)

    const tic = timer.tic()
    try {
      const { sanitizedUri, cacheKey } = resolution

      debugFetch(`Fetching from cache [${sanitizedUri}]`)

      const data = await fetchCacheContent(cacheKey)
      const elapsedTime = tic.toc()
      if (!data) {
        const tags = ['operation:fetch', 'result:error', `source:${this.name}`]
        sendMetrics([
          // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
          { type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags }
        ])
        throw new Error('data error from cache')
      }
      debugTimer(`Fetched from cache [${sanitizedUri}]`, elapsedTime)
      const tags = ['operation:fetch', 'result:cache_hit', `source:${this.name}`]
      sendMetrics([
        // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
        { type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags },
        { type: METRIC_TYPES.CACHE_RESULT_SIZE, value: JSON.stringify(data).length, tags }
      ])

      return data
    } catch (err) {
      const elapsedTime = tic.toc()
      const tagResult = (err.statusCode && err.statusCode === 404) ? 'result:cache_miss' : 'result:cache_error'
      const tags = ['operation:fetch', tagResult, `source:${this.name}`]
      sendMetrics([
        // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
        { type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags }
      ])

      return this._update(resolution, options)
    }
  }

  formatUri (uri, options) {
    const base = super.formatUri(uri, options)
    const cacheKey = getCacheKey(uri, options)

    debugFetch(`cache key: ${base.sanitizedUri} => ${cacheKey}`)

    return Object.assign(
      base,
      { cacheKey }
    )
  }

  async _update (resolution, options) {
    const data = await this._fetch(resolution, options)

    if (!cacheProxyUrl) {
      return data
    }

    const tic = timer.tic()

    await pushCacheContent(resolution.cacheKey, data)

    try {
      const elapsedTime = tic.toc()
      const tags = ['operation:put', 'result:success', `source:${this.name}`]
      sendMetrics([
        // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
        { type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags },
        { type: METRIC_TYPES.CACHE_RESULT_SIZE, value: JSON.stringify(data).length, tags }
      ])

      return data
    } catch (err) {
      const elapsedTime = tic.toc()
      const tags = ['operation:put', 'result:error', `source:${this.name}`, `error:${err.statusCode}`]
      sendMetrics([
        // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
        { type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags }
      ])
      // DO NOT THROW FOR FAILED CACHE WRITE!!!
      // throw new Error(`Error putting into cache ${this.name}`)

      return data
    }
  }

  async update (query, options) {
    this._update(this.resolve(query, options), options)
  }
}

module.exports = CachedSource
