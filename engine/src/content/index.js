'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine:content')

const CachedSource = require('./models/cached')
const FetchSource = require('./models/fetch')
const JsonSource = require('./models/json')

const unpack = require('../utils/unpack')

const { buildRoot } = require('../../environment')

function loadSourceConfigs (sourceName) {
  try {
    return unpack(require(path.join(buildRoot, 'content', 'sources', sourceName)))
  } catch (err) {
    console.error(err)
    throw new Error(`Could not find source: ${sourceName}`)
  }
}

function createSource (sourceName) {
  const sourceConfig = loadSourceConfigs(sourceName)

  debug('loaded source', sourceName, sourceConfig)

  if (sourceConfig.fetch && sourceConfig.fetch instanceof Function) {
    return new FetchSource(sourceName, sourceConfig)
  } else if (sourceConfig.resolve && sourceConfig.resolve instanceof Function) {
    return new CachedSource(sourceName, sourceConfig)
  } else {
    return new JsonSource(sourceName, sourceConfig)
  }
}

const cache = {}
function getContentSource (sourceName) {
  if (!cache[sourceName]) {
    cache[sourceName] = createSource(sourceName)
  }
  return cache[sourceName]
}

module.exports = {
  getContentSource
}
