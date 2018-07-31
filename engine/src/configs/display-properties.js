'use strict'

const unpack = require('../utils/unpack')

function getDisplayProperties (componentConfig) {
  const Component = unpack(require(componentConfig.dist))
  const displayProperties = Component.propTypes && Component.propTypes.displayProperties
  if (displayProperties) {
    if (!(displayProperties instanceof Object)) {
      throw new Error(`${componentConfig.type}/${componentConfig.id}: propTypes.displayProperties must be an Object`)
    }
    if (displayProperties.type !== 'shape') {
      throw new Error(`${componentConfig.type}/${componentConfig.id}: propTypes.displayProperties must be a shape`)
    }

    return displayProperties.args
  }

  return null
}

module.exports = getDisplayProperties
