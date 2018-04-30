'use strict'

const url = require('url')

const request = require('request-promise-native')

const debugFetch = require('debug')('fusion:content:sources:fetch')

const {
  contentBase,
  sourcesRoot
} = require('../environment')

const getSchemaFilter = require('./filter')

const {
  getSourceConfig
} = require('../models/sources')

function fetch (key) {
  return Promise.resolve(url.resolve(contentBase, this.resolve(key)))
    .then((uri) => {
      debugFetch(uri)
      return request(uri)
    })
    .then((data) => JSON.parse(data))
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

const expandProperties = function expandProperties (string, properties) {
  return string.replace(/\{([^}]+)\}/g, function (match, prop) {
    return (prop === 'key')
      ? properties
      : properties[prop.replace(/^key\./, '')] || match
  })
}

const getJsonResolver = function getJsonResolver (config) {
  return function resolve (key) {
    const path = expandProperties(config.pattern, key)

    const query = config.params
      .map((param) => {
        return (param.dropWhenEmpty && !(param.name in key))
          ? null
          : `${param.name}=${key[param.name]}`
      })
      .filter(v => v)
      .join('&')

    return `${path}${query ? `?${query}` : ''}`
  }
}

const getSourceResolver = function getSourceResolver (source) {
  const nativeResolve = source.resolve
  return (nativeResolve instanceof Function)
    ? nativeResolve
    : getJsonResolver(source)
}

const getBundleSource = function getBundleSource (sourceName) {
  try {
    return Promise.resolve(require(`${sourcesRoot}/${sourceName}`))
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

      return Object.assign(
        source,
        {
          fetch,
          filter: getSchemaFilter(source.schemaName),
          resolve: getSourceResolver(source)
        }
      )
    })

  return sourceCache[sourceName]
}

module.exports = getSource
