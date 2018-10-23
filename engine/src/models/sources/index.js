'use strict'

const unpack = require('../../utils/unpack')
const logger = require('../../utils/logger')

const {
  sourcesDistRoot
} = require('../../../environment')

const CachedSource = require('./classes/cached')
const FetchSource = require('./classes/fetch')
const JsonSource = require('./classes/json')

const getBundleSource = function getBundleSource (sourceName) {
  try {
    return Promise.resolve(unpack(require(`${sourcesDistRoot}/${sourceName}`)))
  } catch (e) {
    logger.logError({ message: 'An error occurred while attempting to get the bundle source.', stackTrace: e.stack })
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

      return (source.fetch && source.fetch instanceof Function)
        ? new FetchSource(sourceName, source)
        : (source.resolve && source.resolve instanceof Function)
          ? new CachedSource(sourceName, source)
          : new JsonSource(sourceName, source)
    })

  return sourceCache[sourceName]
}

module.exports = getSource
