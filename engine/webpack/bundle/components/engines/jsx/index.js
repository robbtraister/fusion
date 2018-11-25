'use strict'

module.exports = (env) => {
  const getCollectionConfigs = require('./collections')(env)
  const getCombinationConfigs = require('./combinations')(env)
  const getOutputTypeConfigs = require('./output-types')(env)

  const componentManifest = require('./get-manifest')(env)()

  return [].concat(
    getOutputTypeConfigs(componentManifest),
    getCollectionConfigs(componentManifest),
    getCombinationConfigs(componentManifest)
  )
}
