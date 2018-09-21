'use strict'

const {
  componentDistRoot,
  contentDistRoot
} = require('../environment')
const { logError } = require('../src/utils/logger')

function getManifest (rootDir, collection) {
  try {
    const manifestFile = `${rootDir}/${collection}/fusion.manifest.json`
    return require(manifestFile)
  } catch (e) {
    logError({message: `An error occurred while attempting to get manifest: ${e.toString()}`})
  }
}

module.exports = {
  components: {
    chains: getManifest(componentDistRoot, 'chains'),
    features: getManifest(componentDistRoot, 'features'),
    layouts: getManifest(componentDistRoot, 'layouts'),
    outputTypes: getManifest(componentDistRoot, 'output-types')
  },
  content: {
    sources: getManifest(contentDistRoot, 'sources'),
    schemas: getManifest(contentDistRoot, 'schemas')
  }
}
