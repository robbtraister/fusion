'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine:content')

const CachedSource = require('./models/cached')
const FetchSource = require('./models/fetch')
const JsonSource = require('./models/json')

const unpack = require('../utils/unpack')

module.exports = (env) => {
  require('./mocks')(env)

  const { buildRoot } = env

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
      return new FetchSource(sourceConfig, env)
    } else if (sourceConfig.resolve && sourceConfig.resolve instanceof Function) {
      return new CachedSource(sourceConfig, env)
    } else {
      return new JsonSource(sourceConfig, env)
    }
  }

  const cache = {}
  function getContentSource (sourceName) {
    if (!cache[sourceName]) {
      cache[sourceName] = createSource(sourceName)
    }
    return cache[sourceName]
  }

  return {
    getContentSource
  }
}
