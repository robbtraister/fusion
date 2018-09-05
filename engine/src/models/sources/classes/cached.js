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

function getCacheKey (uri) {
  const hash = crypto.createHash('sha256').update(uri).digest('hex')
  return `${cachePrefix}:${hash}`
}

async function makeCacheRequest ({method, key, value}) {
  return (cacheProxyUrl)
    ? request(
      Object.assign(
        {
          method: method || 'GET',
          uri: `${cacheProxyUrl}?key=${key}`
        },
        // don't depend on existence of value, since you might want to push null/undefined
        (/^(POST|PUT)$/.test(method))
          ? {body: value}
          : {}
      )
    )
    : Promise.resolve()
}

const clearCacheContent = async (key) => makeCacheRequest({key, method: 'DELETE'})
const fetchCacheContent = async (key) => makeCacheRequest({key})
const pushCacheContent = async (key, value) => makeCacheRequest({key, value, method: 'PUT'})

class CachedSource extends ResolveSource {
  async clear (key) {
    const { cacheKey } = this.resolve(key)

    return clearCacheContent(cacheKey)
      .catch((err) => {
        if (err.response) {
          const responseError = new Error(err.response.body)
          responseError.statusCode = err.response.statusCode
          throw responseError
        }
        throw err
      })
  }

  async fetch (key, forceSync) {
    return this.fetchThroughCache(key, forceSync)
      .then((data) => this.transform(data))
      .catch((err) => {
        if (err.response) {
          const responseError = new Error(err.response.body)
          responseError.statusCode = err.response.statusCode
          throw responseError
        }
        throw err
      })
  }

  async fetchThroughCache (key, forceSync) {
    return (cacheProxyUrl && forceSync !== true)
      ? Promise.resolve(this.resolve(key))
        .then(({ cacheKey, sanitizedUri }) => {
          const tic = timer.tic()

          debugFetch(`Fetching from cache [${sanitizedUri}]`)

          return fetchCacheContent(cacheKey)
            .then((data) => {
              const elapsedTime = tic.toc()
              if (!data) {
                const tags = ['operation:fetch', 'result:error', `source:${this.name}`]
                sendMetrics([
                  // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
                  {type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags}
                ])
                throw new Error('data error from cache')
              }
              debugTimer(`Fetched from cache [${sanitizedUri}]`, elapsedTime)
              const tags = ['operation:fetch', 'result:cache_hit', `source:${this.name}`]
              sendMetrics([
                // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
                {type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags},
                {type: METRIC_TYPES.CACHE_RESULT_SIZE, value: JSON.stringify(data).length, tags}
              ])

              return data
            })
            .catch(error => {
              const elapsedTime = tic.toc()
              const tagResult = (error.statusCode && error.statusCode === 404) ? 'result:cache_miss' : 'result:cache_error'
              const tags = ['operation:fetch', tagResult, `source:${this.name}`]
              sendMetrics([
                // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
                {type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags}
              ])

              return this.update(key)
            })
        })
      : this.update(key)
  }

  formatUri (uri) {
    const base = super.formatUri(uri)
    const cacheKey = getCacheKey(uri)

    debugFetch(`cache key: ${base.sanitizedUri} => ${cacheKey}`)

    return Object.assign(
      base,
      { cacheKey }
    )
  }

  async update (key) {
    return Promise.all([
      super.fetch(key),
      this.resolve(key)
    ])
      .then(([data, { cacheKey }]) => {
        const tic = timer.tic()

        return (cacheProxyUrl)
          ? pushCacheContent(cacheKey, data)
            .then(() => {
              const elapsedTime = tic.toc()
              const tags = ['operation:put', 'result:success', `source:${this.name}`]
              sendMetrics([
                // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
                {type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags},
                {type: METRIC_TYPES.CACHE_RESULT_SIZE, value: JSON.stringify(data).length, tags}
              ])

              return data
            })
            .catch((error) => {
              const elapsedTime = tic.toc()
              const tags = ['operation:put', 'result:error', `source:${this.name}`, `error:${error.statusCode}`]
              sendMetrics([
                // {type: METRIC_TYPES.CACHE_RESULT, value: 1, tags},
                {type: METRIC_TYPES.CACHE_LATENCY, value: elapsedTime, tags}
              ])
              // DO NOT THROW FOR FAILED CACHE WRITE!!!
              // throw new Error(`Error putting into cache ${this.name}`)

              return data
            })
          : data
      })
  }
}

module.exports = CachedSource
