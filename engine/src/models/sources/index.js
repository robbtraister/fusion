'use strict'

const unpack = require('../../utils/unpack')

const {
  sourcesBuildRoot
} = require('../../../environment')

const CachedSource = require('./classes/cached')
const FetchSource = require('./classes/fetch')
const JsonSource = require('./classes/json')

const getBundleSource = async function getBundleSource (sourceName) {
  try {
    return Promise.resolve(unpack(require(`${sourcesBuildRoot}/${sourceName}`)))
  } catch (e) {
    return Promise.resolve(null)
  }
}

const sourceCache = {}
const getSource = async function getSource (sourceName) {
  if (!sourceCache[sourceName]) {
    const source = await getBundleSource(sourceName)
    if (!source) {
      delete sourceCache[sourceName]
      throw new Error(`Could not find source: ${sourceName}`)
    }

    sourceCache[sourceName] = (source.fetch && source.fetch instanceof Function)
      ? new FetchSource(sourceName, source)
      : (source.resolve && source.resolve instanceof Function)
        ? new CachedSource(sourceName, source)
        : new JsonSource(sourceName, source)
  }

  return sourceCache[sourceName]
}

module.exports = getSource
