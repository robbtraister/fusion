'use strict'

const {
  componentBuildRoot,
  contentBuildRoot
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
