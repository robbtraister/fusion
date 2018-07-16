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
  distRoot,
  contextPath
} = require('../environment')

const { components } = require('../environment/manifest')

const variablesSrcDir = path.resolve(__dirname, '../generated')
childProcess.execSync(`mkdir -p '${variablesSrcDir}'`)
const variablesSrcFile = path.resolve(variablesSrcDir, `variables.js`)

const globalFile = (() => {
  try {
    const globalFile = require.resolve('../bundle/variables')
    require(globalFile)
    return globalFile
  } catch (e) {
    return false
  }
})()

const siteFiles = Object.assign(
  {},
  ...glob.sync(`${__dirname}/../bundle/variables/sites/*`)
    .filter(fp => {
      try {
        require(fp)
        return true
      } catch (e) {
        return false
      }
    })
    .map(fp => ({[path.parse(fp).name]: fp}))
)

fs.writeFileSync(variablesSrcFile,
  `
const variables = {
  global: ${globalFile ? `require('${globalFile}')` : '{}'},
  sites: {
    ${
  Object.keys(siteFiles)
    .map(name => `'${name}': require('${siteFiles[name]}')`).join(',\n    ')
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

module.exports = {
  entry: {
    admin: require.resolve('../src/react/client/admin'),
    react: require.resolve('../src/react/client')
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
    path: path.resolve(distRoot, 'engine')
  },
  plugins: [
    new ManifestPlugin({fileName: 'webpack.manifest.json'}),
    ...Object.keys(components.outputTypes)
      .map((outputType) => {
        return new HandlebarsPlugin({
          entry: require.resolve('../src/react/client/preview.html.hbs'),
          output: path.resolve(distRoot, 'engine', 'preview', `${outputType}.html`),
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
}
