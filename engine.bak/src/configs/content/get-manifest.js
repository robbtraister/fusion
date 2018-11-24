'use strict'

const {
  contentBuildRoot
} = require('../../../environment')

module.exports = (collection) => {
  try {
    return require(`${contentBuildRoot}/${collection}/fusion.manifest.json`)
  } catch (e) {
    return {}
  }
}
