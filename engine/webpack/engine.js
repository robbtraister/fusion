'use strict'

const path = require('path')

// const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
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
      // each entry is watched independently, so we can't reliably clean all components
      // new CleanWebpackPlugin(
      //   [
      //     'engine'
      //   ],
      //   {
      //     root: distRoot,
      //     watch: true
      //   }
      // ),
      new CopyWebpackPlugin([
        {
          from: require.resolve('../src/react/client/preview.html'),
          to: path.resolve(distRoot, 'engine', '[name].[ext]'),
          transform: (content) => content.toString().replace(/\$\{CONTEXT_PATH\}/g, contextPath)
        }
      ])
    ],
    resolve,
    target: 'web',
    watchOptions: {
      ignored: /node_modules/
    }
  }
]
