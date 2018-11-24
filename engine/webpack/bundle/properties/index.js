'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

module.exports = (env) => {
  const { buildRoot, bundleRoot } = env

  const srcDir = `${bundleRoot}/properties`
  const propertiesFile = require('./get-file')(env)

  const globalFile = getRequirable(srcDir)
  const siteFiles = Object.assign(
    {},
    ...glob.sync(`${bundleRoot}/properties/sites/*.{js,json,ts}`)
      .filter(getRequirable)
      .map(fp => ({ [path.parse(fp).name]: fp }))
  )

  fs.writeFileSync(propertiesFile,
    `
const unpack = require('${require.resolve('../../../src/utils/unpack')}')
const properties = {
  global: ${globalFile ? `unpack(require('${globalFile}'))` : '{}'},
  sites: {
    ${
  Object.keys(siteFiles)
    .map(name => `'${name}': unpack(require('${siteFiles[name]}'))`).join(',\n    ')
}
  }
}

const siteCache = {}
module.exports = (siteName) => {
  siteCache[siteName] = siteCache[siteName] || Object.assign(
    {},
    properties.global || {},
    properties.sites[siteName] || {}
  )
  return siteCache[siteName]
}
`)

  return [
    {
      ...require('../../_shared/mode')(env),
      ...require('../../_shared/optimization')(env),
      ...require('../../_shared/resolve')(env),
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
