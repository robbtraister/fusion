'use strict'

const {
  fetch: fetchThroughCache,
  clear: clearFromCache
} = require('./cache')

const unpack = require('../../utils/unpack')

const {
  sourcesDistRoot
} = require('../../../environment')

const getSchemaFilter = require('./filter')

const expandProperties = function expandProperties (string, properties) {
  return string.replace(/\{([^}]+)\}/g, function (match, prop) {
    return (prop === 'key')
      ? properties
      : properties[prop.replace(/^key\./, '')] || match
  })
}

const getJsonResolver = function getJsonResolver (config) {
  return config.pattern
    ? function resolve (key) {
      const path = expandProperties(config.pattern, key)

      const query = config.params
        .map((param) => {
          return (param.dropWhenEmpty && !(param.name in key))
            ? null
            : `${param.name}=${key[param.name] || param.default}`
        })
        .filter(v => v)
        .join('&')

      return `${path}${query ? `?${query}` : ''}`
    }
    : null
}

const getSourceResolver = function getSourceResolver (source) {
  return (source instanceof Function)
    ? source
    : (source.resolve instanceof Function)
      ? source.resolve
      : getJsonResolver(source)
}

const getSourceClearer = function getSourceClearer (source) {
  const resolve = getSourceResolver(source)

  return resolve
    ? (key) => {
      return Promise.resolve()
        .then(() => resolve(key))
        .then((contentUri) => clearFromCache(contentUri))
        .catch((err) => {
          if (err.response) {
            const responseError = new Error(err.response.body)
            responseError.statusCode = err.response.statusCode
            throw responseError
          }
          throw err
        })
    }
    : null
}

const getSourceFetcher = function getSourceFetcher (source) {
  const resolve = getSourceResolver(source)

  const transform = source.transform || source.mutate || ((json) => json)

  return resolve
    ? function fetch (key, forceSync) {
      // start with an empty Promise so that this.resolve can return a static value or a Promise
      // this way, we get proper error handling in either case
      return Promise.resolve()
        .then(() => resolve(key))
        .then((contentUri) => fetchThroughCache(contentUri, forceSync))
        .then((data) => JSON.parse(data))
        .then(transform)
        .catch((err) => {
          if (err.response) {
            const responseError = new Error(err.response.body)
            responseError.statusCode = err.response.statusCode
            throw responseError
          }
          throw err
        })
    }
    : null
}

const getBundleSource = function getBundleSource (sourceName) {
  try {
    return Promise.resolve(unpack(require(`${sourcesDistRoot}/${sourceName}`)))
  } catch (e) {
    return Promise.resolve(null)
  }
}

const sourceCache = {}
const getSource = function getSource (sourceName) {
  sourceCache[sourceName] = sourceCache[sourceName] || getBundleSource(sourceName)
    .then((source) => {
      if (!source) {
        delete sourceCache[sourceName]
        throw new Error(`Could not find source: ${sourceName}`)
      }

      const fetch = source.fetch || getSourceFetcher(source)
      if (!fetch) {
        delete sourceCache[sourceName]
        throw new Error(`Could not load source: ${sourceName}`)
      }

      if (source.params && source.params instanceof Object && !(source.params instanceof Array)) {
        source.params = Object.keys(source.params)
          .map((name) => ({
            name,
            type: source.params[name]
          }))
      }
      if (source.params) {
        source.params.forEach((p) => { p.displayName = p.displayName || p.name })
      }

      return {
        clear: getSourceClearer(source),
        fetch,
        filter: getSchemaFilter(source.schemaName),
        name: sourceName,
        params: source.params || null,
        pattern: source.pattern || null,
        schemaName: source.schemaName
      }
    })

  return sourceCache[sourceName]
}

module.exports = getSource
