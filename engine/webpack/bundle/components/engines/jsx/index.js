'use strict'

const getCollectionConfigs = require('./collections')
const getCombinationConfigs = require('./combinations')
const getOutputTypeConfigs = require('./output-types')

module.exports = (manifest) =>
  [].concat(
    getOutputTypeConfigs(manifest),
    getCollectionConfigs(manifest),
    getCombinationConfigs(manifest)
  )
