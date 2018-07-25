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
  bundleGeneratedRoot: variablesSrcDir,
  bundleSrcRoot,
  contextPath
} = require('../environment')

const { components } = require('../environment/manifest')

childProcess.execSync(`mkdir -p '${variablesSrcDir}'`)
const variablesSrcFile = path.resolve(variablesSrcDir, `variables.js`)

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

const globalFile = getRequirable(`${bundleSrcRoot}/variables`)

const siteFiles = Object.assign(
  {},
  ...glob.sync(`${bundleSrcRoot}/variables/sites/*.{js,json}`)
    .filter(getRequirable)
    .map(fp => ({[path.parse(fp).name]: fp}))
)

fs.writeFileSync(variablesSrcFile,
  `
const variables = {
  global: ${globalFile ? `require('${path.relative(variablesSrcDir, globalFile)}')` : '{}'},
  sites: {
    ${
  Object.keys(siteFiles)
    .map(name => `'${name}': require('${path.relative(variablesSrcDir, siteFiles[name])}')`).join(',\n    ')
}
  }
}

const siteCache = {}
module.exports = (siteName) => {
  siteCache[siteName] = siteCache[siteName] || Object.assign(
    {},
    variables.global || {},
    variables.sites[siteName] || {}
  )
  return siteCache[siteName]
}
`)

module.exports = [
  {
    entry: {
      admin: require.resolve('../src/react/client/admin'),
      react: require.resolve('../src/react/client'),
      variables: require.resolve(variablesSrcFile)
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
      ...Object.keys(components.outputTypes)
        .map((outputType) => {
          return new HandlebarsPlugin({
            entry: require.resolve('../src/react/client/preview.html.hbs'),
            output: path.resolve(bundleDistRoot, 'engine', 'preview', `${outputType}.html`),
            data: {
              contextPath,
              outputType
            }
          })
        })
    ],
    resolve: Object.assign(
      {},
      resolve,
      {
        alias: {
          'fusion:variables': variablesSrcFile
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
      variables: require.resolve(variablesSrcFile)
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
