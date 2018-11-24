'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const template = require('./template')

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

module.exports = (env) => {
  const { buildRoot, bundleRoot, generatedRoot } = env

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

  return [
    {
      ...require('../../_shared')(env),
      entry: {
        'properties.js': propertiesFile
      },
      module: {
        rules: [
          require('../../_shared/rules/js')(env)
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
