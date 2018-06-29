'use strict'

const path = require('path')

const HandlebarsPlugin = require('handlebars-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const outputTypes = require('./shared/output-types')
const resolve = require('./shared/resolve')

const {
  distRoot,
  contextPath
} = require('../environment')

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
      path: path.resolve(distRoot, 'engine'),
      library: 'react',
      libraryTarget: 'var'
    },
    plugins: [
      new ManifestPlugin({fileName: 'manifest.json'}),
      ...Object.keys(outputTypes)
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
    target: 'web',
    watchOptions: {
      ignored: /node_modules/
    }
  }
]
