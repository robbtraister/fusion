'use strict'

const path = require('path')

const resolvePreact = /^prod/i.test(process.env.NODE_ENV)
  ? {
    extensions: ['.js', '.jsx'],
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat'
    }
  }
  : {}

module.exports = [
  {
    entry: {
      hbs: './client/hbs/engine.js',
      react: './client/react/engine.js',
      vuejs: './client/vuejs/engine.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist', 'client')
    },
    resolve: resolvePreact,
    module: {
      rules: [
        {
          test: /\.jsx?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                'es2015',
                'react'
              ],
              'plugins': [
                'transform-decorators-legacy'
              ]
            }
          }
        }
      ]
    }
  }
]
