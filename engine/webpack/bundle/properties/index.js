'use strict'

const fs = require('fs')
const path = require('path')

const template = require('./template')

const { buildRoot, bundleRoot, generatedRoot } = require('../../../environment')

const propertiesFile = path.resolve(generatedRoot, 'properties.js')

function getAbsolutePath (relativePath) {
  return relativePath && path.resolve(bundleRoot, relativePath)
}

module.exports = ({ properties }) => {
  fs.writeFileSync(
    propertiesFile,
    template({
      globalFile: getAbsolutePath(properties.global),
      siteFiles: Object.assign(
        {},
        ...Object.keys(properties.sites)
          .map((siteName) => {
            return { [siteName]: getAbsolutePath(properties.sites[siteName]) }
          })
      )
    }))

  return [
    {
      ...require('../../_shared'),
      entry: {
        'properties.js': propertiesFile
      },
      module: {
        rules: [
          require('../../_shared/rules/js'),
          require('../../_shared/rules/yml')
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
}
