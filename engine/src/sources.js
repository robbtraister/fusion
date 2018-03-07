'use strict'

const path = require('path')
const url = require('url')

const request = require('request-promise-native')

const contentBase = process.env.CONTENT_BASE || ''
const sourcesRoot = path.resolve(process.env.SOURCES_ROOT || `${__dirname}/../assets/content/sources`)

const getSchemaFilter = require('./filter')

const getSourceFetcher = function getSourceFetcher (source) {
  return (key) => request(url.resolve(contentBase, source.resolve(key)))
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

const sourceCache = {}
const getSource = function getSource (sourceName) {
  if (!(sourceName in sourceCache)) {
    try {
      const source = require(`${sourcesRoot}/${sourceName}`)
      sourceCache[sourceName] = Object.assign(
        source,
        {
          fetch: getSourceFetcher(source),
          filter: getSchemaFilter(source.schemaName),
          resolve: getSourceResolver(source)
        }
      )
    } catch (err) {
      console.log(err)
      throw err
    }
  }
  return sourceCache[sourceName]
}

module.exports = getSource
