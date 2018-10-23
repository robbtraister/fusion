'use strict'

const {
  componentBuildRoot,
  contentBuildRoot
} = require('../environment')
const logger = require('../src/utils/logger')

function getManifest (rootDir, collection) {
  try {
    const manifestFile = `${rootDir}/${collection}/fusion.manifest.json`
    return require(manifestFile)
  } catch (error) {
    logger.logError({ message: `An error occurred while attempting to get manifest.`, stackTrace: error.stack })
  }
}

module.exports = {
  components: {
    chains: getManifest(componentBuildRoot, 'chains'),
    features: getManifest(componentBuildRoot, 'features'),
    layouts: getManifest(componentBuildRoot, 'layouts'),
    outputTypes: getManifest(componentBuildRoot, 'output-types')
  },
  content: {
    sources: getManifest(contentBuildRoot, 'sources'),
    schemas: getManifest(contentBuildRoot, 'schemas')
  }
}
