'use strict'

const crypto = require('crypto')

const request = require('request-promise-native')

const ResolveSource = require('./resolve')

class CachedSource extends ResolveSource {
  constructor (config, env) {
    super(config, env)

    const makeCacheRequest = (this.env.cacheProxyUrl)
      ? async ({ method, key, value, ttl }) => {
        return request(
          Object.assign(
            {
              method: method || 'GET',
              uri: `${this.env.cacheProxyUrl}?key=${key}${ttl ? `&ttl=${ttl}` : ''}`,
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

    if (this.env.cacheProxyUrl && options.forceUpdate !== true) {
      try {
        const response = await this.fetchCacheContent(cacheKey)
        if (!response) {
          throw new Error('Response error from cache')
        }
        return response
      } catch (_) {}
    }

    return this.updateResolution(resolution, options)
  }

  getCacheKey (uri, options = {}) {
    const followRedirect = options.followRedirect !== false
    const hash = crypto.createHash('sha256').update(uri).digest('hex')
    return `${this.env.cachePrefix}:${followRedirect}:${hash}`
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
    const data = await super.fetchResolution(resolution, options)

    if (!this.env.cacheProxyUrl) {
      return data
    }

    await this.pushCacheContent(resolution.cacheKey, data, this.ttl)

    return data
  }
}

module.exports = CachedSource
