#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const frontMatter = require('front-matter')
const glob = require('glob')

const getEngine = require('./get-engine')

const unpack = require('../../../../src/utils/unpack')

const { bundleRoot, defaultOutputType } = require('../../../../environment')

function getConfigs (outputTypeFile) {
  return (/\.hbs$/i.test(outputTypeFile))
    ? frontMatter(fs.readFileSync(outputTypeFile).toString()).attributes
    : unpack(require(outputTypeFile))
}

function getOutputTypeManifests () {
  const outputTypeFiles = glob.sync(path.resolve(bundleRoot, 'components', 'output-types', `*.{hbs,js,jsx,ts,tsx}`))

  const outputTypeMap = {}
  outputTypeFiles.forEach((outputTypeFile) => {
    const fileParts = path.parse(outputTypeFile)
    const map = outputTypeMap[fileParts.ext] = outputTypeMap[fileParts.ext] || {}
    map[fileParts.base] = fileParts.name
    map[fileParts.name] = fileParts.name
  })

  function getOutputTypeManifest (outputTypeFile) {
    try {
      const src = path.relative(bundleRoot, outputTypeFile)
      const fileParts = path.parse(src)
      const isDefault = (defaultOutputType === fileParts.base) || (defaultOutputType === fileParts.name)
      const fallbackOptions = outputTypeMap[fileParts.ext]

      const OutputType = getConfigs(outputTypeFile)

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
        [fileParts.name]: {
          category: 'components',
          collection: 'output-types',
          type: fileParts.name,
          base: fileParts.base,
          ext: fileParts.ext,
          engine: getEngine(fileParts.ext),
          entry: path.join(fileParts.dir, fileParts.name),
          src,
          options
        }
      }
    } catch (err) {
      console.error(err)
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

module.exports = getOutputTypeManifests

if (module === require.main) {
  console.log(JSON.stringify(getOutputTypeManifests(), null, 2))
}
