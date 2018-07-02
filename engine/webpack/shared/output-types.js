'use strict'

const {
  components
} = require('../../environment/bundle')

module.exports = Object.assign(
  ...Object.keys(components.outputTypes)
    .map(key => components.outputTypes[key])
    .map(outputType => ({[outputType.componentName]: outputType.src}))
)
