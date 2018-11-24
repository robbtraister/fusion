'use strict'

const path = require('path')

const PropTypes = require('@arc-fusion/prop-types')
const unpack = require('../../utils/unpack')

const {
  bundleRoot
} = require('../../../environment')

function getDisplayPropTypes (componentConfig) {
  const Component = unpack(require(path.join(bundleRoot, componentConfig.dist)))
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
