'use strict'

const path = require('path')

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

const {
  clientEntries: entry
} = require('../src/react')

module.exports = [
  {
    entry,
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
    resolve,
    target,
    watchOptions: {
      ignored: /node_modules/
    }
  }
]
