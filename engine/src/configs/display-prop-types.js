'use strict'

const unpack = require('../utils/unpack')

function getDisplayPropTypes (componentConfig) {
  const Component = unpack(require(componentConfig.dist))
  const displayPropTypes = Component && Component.displayPropTypes
  if (displayPropTypes) {
    if (!(displayPropTypes instanceof Object)) {
      throw new Error(`${componentConfig.type}/${componentConfig.id}: displayProps must be an Object`)
    }
    if (displayPropTypes.type !== 'shape') {
      throw new Error(`${componentConfig.type}/${componentConfig.id}: displayProps must be a shape`)
    }

    return displayPropTypes.args
  }

  return null
}

module.exports = getDisplayPropTypes
