#!/usr/bin/env node

'use strict'

const path = require('path')

const glob = require('glob')

const unpack = require('../../src/utils/unpack')

function getOutputTypeManifest (env) {
  const { bundleRoot, defaultOutputType } = env

  const outputTypeFiles = glob.sync(path.resolve(bundleRoot, 'components', 'output-types', `*.{js,jsx,ts,tsx}`))

  const outputTypeMap = {}
  outputTypeFiles.forEach((outputTypeFile) => {
    const fileParts = path.parse(outputTypeFile)
    const map = outputTypeMap[fileParts.ext] = outputTypeMap[fileParts.ext] || {}
    map[fileParts.base] = fileParts.base
    map[fileParts.name] = fileParts.base
  })

  function getOutputTypeManifest (outputTypeFile) {
    try {
      const fileParts = path.parse(outputTypeFile)
      const isDefault = (defaultOutputType === fileParts.base) || (defaultOutputType === fileParts.name)
      const fallbackOptions = outputTypeMap[fileParts.ext]

      const OutputType = unpack(require(outputTypeFile))

      // I don't remember if the official API was supposed to be singular or plural
      // and I don't know that I have a preference, so support either
      const definedFallbacks = OutputType.hasOwnProperty('fallback')
        ? OutputType.fallback
        : OutputType.fallbacks

      const fallbacks = (!isDefault && (definedFallbacks === true || definedFallbacks === undefined))
        ? defaultOutputType
        : definedFallbacks

      const options = [fileParts.base]
        .concat(fallbacks || [])
        .map((fallback) => fallbackOptions[fallback])
        .filter((fallback) => fallback)

      return {
        [fileParts.base]: {
          outputType: fileParts.base,
          name: fileParts.name,
          ext: fileParts.ext,
          src: path.relative(bundleRoot, outputTypeFile),
          options
        }
      }
    } catch (err) {
      return {}
    }
  }

  return {
    outputTypes: Object.assign(
      {},
      ...outputTypeFiles
        .map(getOutputTypeManifest)
    )
  }
}

module.exports = getOutputTypeManifest

if (module === require.main) {
  console.log(JSON.stringify(getOutputTypeManifest(require('../../environment'))(process.argv[2]), null, 2))
}
