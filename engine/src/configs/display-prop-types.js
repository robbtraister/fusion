'use strict'

const PropTypes = require('../react/shared/prop-types')
const unpack = require('../utils/unpack')

function getDisplayPropTypes (componentConfig) {
  const Component = unpack(require(componentConfig.dist))
  const displayPropTypes = Component && Component.displayPropTypes
  if (displayPropTypes) {
    if (!(displayPropTypes instanceof Object)) {
      throw new Error(`${componentConfig.type}/${componentConfig.id}: displayProps must be an Object`)
    }

    return JSON.parse(PropTypes.stringify(displayPropTypes))
  }

  return null
}

module.exports = getDisplayPropTypes
