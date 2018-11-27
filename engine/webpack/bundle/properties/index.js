'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const template = require('./template')

const { buildRoot, bundleRoot, generatedRoot } = require('../../../environment')

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

const srcDir = `${bundleRoot}/properties`
const propertiesFile = path.resolve(generatedRoot, 'properties.js')

const globalFile = getRequirable(srcDir)
const siteFiles = Object.assign(
  {},
  ...glob.sync(`${bundleRoot}/properties/sites/*.{js,json,ts}`)
    .filter(getRequirable)
    .map(fp => ({ [path.parse(fp).name]: fp }))
)

fs.writeFileSync(propertiesFile, template({ globalFile, siteFiles }))

module.exports = [
  {
    ...require('../../_shared'),
    entry: {
      'properties.js': propertiesFile
    },
    module: {
      rules: [
        require('../../_shared/rules/js')
      ]
    },
    output: {
      filename: '[name]',
      path: buildRoot,
      libraryTarget: 'commonjs2'
    },
    target: 'node'
  }
]
