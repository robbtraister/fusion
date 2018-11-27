'use strict'

const getCollectionConfigs = require('./collections')
const getCombinationConfigs = require('./combinations')
const getOutputTypeConfigs = require('./output-types')

const componentManifest = require('./get-manifest')()

module.exports = [].concat(
  getOutputTypeConfigs(componentManifest),
  getCollectionConfigs(componentManifest),
  getCombinationConfigs(componentManifest)
)
