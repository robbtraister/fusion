'use strict'

const path = require('path')
const url = require('url')

const request = require('request-promise-native')

const debugFetch = require('debug')('fusion:content:sources:fetch')

const contentBase = process.env.CONTENT_BASE || ''
const sourcesRoot = path.resolve(process.env.SOURCES_ROOT || `${__dirname}/../../bundle/content/sources`)

const getSchemaFilter = require('./filter')

const {
  getSourceConfig
} = require('../models/sources')

const getSourceFetcher = function getSourceFetcher (source) {
  return (key) => Promise.resolve(url.resolve(contentBase, source.resolve(key)))
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
  return string.replace(/\$\{([^}]+)\}/g, function (match, prop) {
    return (prop === 'key')
      ? properties
      : properties[prop.replace(/^key\./, '')] || match
  })
}

const getSourceResolver = function getSourceResolver (source) {
  const nativeResolve = source.resolve
  return (nativeResolve instanceof Function)
    ? nativeResolve
    : (source.pattern)
      ? (key) => expandProperties(source.pattern, key)
      : () => source.uri
}

const getBundleSource = function getBundleSource (sourceName) {
  try {
    return Promise.resolve(require(`${sourcesRoot}/${sourceName}`))
  } catch (e) {
    return Promise.resolve(null)
  }
}

const getDbSource = function getDbSource (sourceName) {
  return getSourceConfig(sourceName)
    .then((config) => {
      return {
        resolve (key) {
          const path = config.pattern.replace(/\{([^}]+)\}/g, (match, prop) => key[prop] || match)

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
    })
}

const sourceCache = {}
const getSource = function getSource (sourceName) {
  sourceCache[sourceName] = sourceCache[sourceName] || getBundleSource(sourceName)
    .then((bundleSource) => bundleSource || getDbSource(sourceName))
    .then((source) => {
      if (!source) {
        delete sourceCache[sourceName]
        throw new Error(`Could not find source: ${sourceName}`)
      }

      return Object.assign(
        source,
        {
          fetch: getSourceFetcher(source),
          filter: getSchemaFilter(source.schemaName),
          resolve: getSourceResolver(source)
        }
      )
    })

  return sourceCache[sourceName]
}

module.exports = getSource
