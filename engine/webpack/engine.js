'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const glob = require('glob')

const DefinePlugin = require('webpack').DefinePlugin
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')

const target = 'web'

const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  bundleDistRoot,
  bundleGeneratedRoot: propertiesSrcDir,
  bundleSrcRoot,
  componentDistRoot,
  contextPath
} = require('../environment')

childProcess.execSync(`mkdir -p '${propertiesSrcDir}'`)
const propertiesSrcFile = path.resolve(propertiesSrcDir, `properties.js`)

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

const globalFile = getRequirable(`${bundleSrcRoot}/properties`)

const siteFiles = Object.assign(
  {},
  ...glob.sync(`${bundleSrcRoot}/properties/sites/*.{js,json,ts}`)
    .filter(getRequirable)
    .map(fp => ({ [path.parse(fp).name]: fp }))
)

fs.writeFileSync(propertiesSrcFile,
  `
const properties = {
  global: ${globalFile ? `require('${path.relative(propertiesSrcDir, globalFile)}')` : '{}'},
  sites: {
    ${
  Object.keys(siteFiles)
    .map(name => `'${name}': require('${path.relative(propertiesSrcDir, siteFiles[name])}')`).join(',\n    ')
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

const alias = {
  'fusion:properties': propertiesSrcFile
}

;[
  'chains',
  'features',
  'layouts',
  'output-types'
]
  .forEach(collection => {
    alias[`fusion:manifest:components:${collection}`] = require.resolve(`${componentDistRoot}/${collection}/fusion.manifest.json`)
  })

module.exports = [
  {
    entry: {
      admin: require.resolve('../src/react/client/admin'),
      polyfill: require.resolve('../src/react/client/polyfill'),
      preview: require.resolve('../src/react/client/preview'),
      properties: require.resolve(propertiesSrcFile),
      react: require.resolve('../src/react/client')
    },
    mode,
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          exclude: /\/node_modules\/(?!@arc-fusion\/)/,
          use: [
            babelLoader
          ]
        }
      ]
    },
    optimization,
    output: {
      filename: `[name].js`,
      path: path.resolve(bundleDistRoot, 'engine')
    },
    plugins: [
      new DefinePlugin({
        __CONTEXT_PATH__: `'${contextPath}'`
      }),
      new ManifestPlugin({ fileName: 'webpack.manifest.json' })
    ],
    resolve: Object.assign(
      {},
      resolve,
      { alias }
    ),
    target,
    watchOptions: {
      ignored: /\/node_modules\//
    }
  },
  {
    entry: {
      properties: require.resolve(propertiesSrcFile)
    },
    mode,
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          exclude: /\/node_modules\/(?!@arc-fusion\/)/,
          use: [
            babelLoader
          ]
        }
      ]
    },
    optimization,
    output: {
      filename: `[name].js`,
      path: path.resolve(bundleDistRoot),
      libraryTarget: 'commonjs2'
    },
    resolve,
    target,
    watchOptions: {
      ignored: /\/node_modules\//
    }
  }
]
