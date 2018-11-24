'use strict'

const path = require('path')

const unpack = require('./unpack')

function getOutputTypes (outputType, fallbacks, defaultOutputType) {
  const fallbackList = (fallbacks === true || fallbacks === undefined)
    ? ((outputType === defaultOutputType) ? [] : [defaultOutputType])
    : ((fallbacks) ? [].concat(fallbacks) : [])

  return [outputType].concat(fallbackList)
}

module.exports = (env) => {
  const { buildRoot, defaultOutputType } = env

  return ({ ext, outputType }) => {
    const outputTypePath = path.resolve(buildRoot, 'components', 'output-types', `${outputType}${ext}`)
    const OutputType = unpack(require(outputTypePath))

    return getOutputTypes(outputType, OutputType.fallbacks, defaultOutputType)
  }
}
