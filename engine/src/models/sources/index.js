'use strict'

const url = require('url')

const request = require('request-promise-native')

const debugFetch = require('debug')('fusion:content:sources:fetch')

const {
  contentBase,
  sourcesDistRoot
} = require('../../../environment')

const getSchemaFilter = require('./filter')
const getSourceConfig = require('./jge').get

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

const getSourceFetcher = function getSourceFetcher (source) {
  const resolve = (source instanceof Function)
    ? source
    : (source.resolve instanceof Function)
      ? source.resolve
      : getJsonResolver(source)

  const transform = source.transform || source.mutate || ((json) => json)

  return resolve
    ? function fetch (key) {
      // start with an empty Promise so that this.resolve can return a static value or a Promise
      // this way, we get proper error handling in either case
      return Promise.resolve()
        .then(() => resolve(key))
        .then((contentUri) => {
          const contentUrl = url.resolve(contentBase, contentUri)
          // don't log content credentials
          debugFetch(url.format(Object.assign(url.parse(contentUrl), {auth: null})))
          return request(contentUrl)
        })
        .then((data) => JSON.parse(data))
        .then(transform)
        .catch((err) => {
          // console.log(err.response)
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
    return Promise.resolve(require(`${sourcesDistRoot}/${sourceName}`))
  } catch (e) {
    return Promise.resolve(null)
  }
}

const sourceCache = {}
const getSource = function getSource (sourceName) {
  sourceCache[sourceName] = sourceCache[sourceName] || getBundleSource(sourceName)
    .then((bundleSource) => bundleSource || getSourceConfig(sourceName))
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

      return {
        clear: () => {},
        fetch,
        filter: getSchemaFilter(source.schemaName),
        name: sourceName,
        params: source.params || null,
        pattern: source.pattern || null
      }
    })

  return sourceCache[sourceName]
}

module.exports = getSource
