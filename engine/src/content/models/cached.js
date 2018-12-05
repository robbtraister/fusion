'use strict'

const crypto = require('crypto')

const request = require('request-promise-native')

const ResolveSource = require('./resolve')

const metrics = require('../../metrics')
const timer = require('../../utils/timer')

const { cachePrefix, cacheProxyUrl } = require('../../../environment')

class CachedSource extends ResolveSource {
  constructor (name, config) {
    super(name, config)

    const makeCacheRequest = (cacheProxyUrl)
      ? async ({ method, key, value, ttl }) => {
        return request(
          Object.assign(
            {
              method: method || 'GET',
              uri: `${cacheProxyUrl}?key=${key}${ttl ? `&ttl=${ttl}` : ''}`,
              json: true
            },
            // don't depend on existence of value, since you might want to push null/undefined
            (/^(POST|PUT)$/.test(method))
              ? { body: value }
              : {}
          )
        )
      }
      : () => Promise.resolve()

    this.clearCacheContent = async (key) => makeCacheRequest({ key, method: 'DELETE' })
    this.fetchCacheContent = async (key) => makeCacheRequest({ key })
    this.pushCacheContent = async (key, value, ttl) => makeCacheRequest({ key, value, ttl, method: 'PUT' })
  }

  async clear (query, options) {
    const resolution = this.resolve(query, options)
    return this.clearCacheContent(resolution.cacheKey)
  }

  async fetchResolution (resolution, options) {
    const { cacheKey } = resolution

    if (options.ignoreCache === true) {
      return super.fetchResolution(resolution, options)
    }

    if (cacheProxyUrl && options.forceUpdate !== true) {
      let result = 'error'
      const latencyTic = timer.tic()
      try {
        const response = await this.fetchCacheContent(cacheKey)
        if (!response) {
          throw new Error('Response error from cache')
        }

        result = 'success'
        metrics({
          'arc.fusion.cache.bytes':
            {
              operation: 'fetch',
              source: this.name,
              value: response.size
            }
        })

        return response
      } catch (err) {
        result = (err.statusCode === 404)
          ? 'miss'
          : 'error'
      } finally {
        metrics({
          'arc.fusion.cache.latency':
            {
              operation: 'fetch',
              source: this.name,
              result,
              value: latencyTic.toc()
            }
        })
      }
    }

    return this.updateResolution(resolution, options)
  }

  getCacheKey (uri, options = {}) {
    const followRedirect = options.followRedirect !== false
    const hash = crypto.createHash('sha256').update(uri).digest('hex')
    return `${cachePrefix}:${followRedirect}:${hash}`
  }

  resolve (query, options) {
    const result = super.resolve(query, options)
    result.cacheKey = this.getCacheKey(result.resolvedUri, options)
    return result
  }

  async update (query, options) {
    const resolution = this.resolve(query, options)
    return this.updateResolution(resolution, options)
  }

  async updateResolution (resolution, options) {
    const payload = await super.fetchResolution(resolution, options)

    if (!cacheProxyUrl) {
      return payload
    }

    const ttl = (payload.expires)
      ? Math.min(this.ttl, (+payload.expires - +new Date()) / 1000)
      : this.ttl

    await this.pushCacheContent(resolution.cacheKey, payload, ttl)

    return payload
  }
}

module.exports = CachedSource
