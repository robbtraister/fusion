'use strict'

const path = require('path')

const babelLoader = require('./shared/loaders/babel-loader')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')

const {
  distRoot
} = require('../src/environment')

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
    target: 'web'
  }
]
