'use strict'

const path = require('path')

// const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')

const {
  distRoot,
  contextPath
} = require('../environment')

module.exports = [
  {
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
      path: path.resolve(distRoot, 'engine'),
      library: 'react',
      libraryTarget: 'var'
    },
    plugins: [
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
    target: 'web'
  }
]
