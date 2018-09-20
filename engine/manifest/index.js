'use strict'

const {
  componentDistRoot,
  contentDistRoot
} = require('../environment')

function getManifest (rootDir, collection) {
  try {
    const manifestFile = `${rootDir}/${collection}/fusion.manifest.json`
    return require(manifestFile)
  } catch (e) {
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
