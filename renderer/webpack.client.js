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
      react: './client/react/engine.js'
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
          loader: ['babel-loader']
        }
      ]
    }
  }
]
