'use strict'

const path = require('path')

const mode = require('./shared/mode')
const optimization = require('./shared/optimization')

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
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  'es2015',
                  'react'
                ],
                plugins: [
                  'transform-decorators-legacy'
                ],
                comments: false
              }
            }
          ]
        }
      ]
    },
    optimization,
    output: {
      filename: `[name].js`,
      path: path.resolve(__dirname, '..', 'dist', 'engine'),
      library: 'react',
      libraryTarget: 'var'
    },
    target: 'web'
  }
]
