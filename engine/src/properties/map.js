'use strict'

const path = require('path')

const glob = require('glob')

const unpack = require('../utils/unpack')

const { bundleRoot } = require('../../environment')

function getRequireable (fileReference) {
  try {
    return unpack(require(fileReference))
  } catch (_) {
    return false
  }
}

const globalPropertiesPath = path.resolve(bundleRoot, 'properties')

const sitePropertiesPaths = {}
glob.sync(path.resolve(globalPropertiesPath, 'sites', '*.{js,json}'))
  .forEach((sitePropertiesFile) => {
    const properties = getRequireable(sitePropertiesFile)
    if (properties) {
      sitePropertiesPaths[path.parse(sitePropertiesFile).name] = properties
    }
  })

const result = {
  global: getRequireable(globalPropertiesPath) || {},
  sites: sitePropertiesPaths
}

module.exports = result
