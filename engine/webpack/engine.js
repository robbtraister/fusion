'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const glob = require('glob')

const HandlebarsPlugin = require('handlebars-webpack-plugin')
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
  ...glob.sync(`${bundleSrcRoot}/properties/sites/*.{js,json}`)
    .filter(getRequirable)
    .map(fp => ({[path.parse(fp).name]: fp}))
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

module.exports = [
  {
    entry: {
      admin: require.resolve('../src/react/client/admin'),
      react: require.resolve('../src/react/client'),
      properties: require.resolve(propertiesSrcFile)
    },
    mode,
    module: {
      rules: [
        {
          test: /\.jsx?$/i,
          exclude: /node_modules/,
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
      new ManifestPlugin({fileName: 'webpack.manifest.json'}),
      new HandlebarsPlugin({
        entry: require.resolve('../src/react/client/preview.html.hbs'),
        output: path.resolve(bundleDistRoot, 'engine', 'preview.html'),
        data: {
          contextPath
        }
      })
    ],
    resolve: Object.assign(
      {},
      resolve,
      {
        alias: {
          'fusion:properties': propertiesSrcFile
        }
      }
    ),
    target,
    watchOptions: {
      ignored: /node_modules/
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
          test: /\.jsx?$/i,
          exclude: /node_modules/,
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
      ignored: /node_modules/
    }
  }
]
