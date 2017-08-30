'use strict'

const path = require('path')

// const CopyWebpackPlugin = require('copy-webpack-plugin')

const resolvePreact = {
  extensions: ['.js', '.jsx'],
  alias: {
    react: 'preact-compat',
    'react-dom': 'preact-compat'
  }
}

module.exports = [
  {
    entry: {
      engine: './client/react/engine.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist', 'react')
    },
    resolve: /^prod/i.test(process.env.NODE_ENV) ? resolvePreact : {},
    module: {
      loaders: [
        {
          test: /\.jsx?$/i,
          exclude: /node_modules/,
          loader: ['babel-loader']
        }
      ]
    }
  }
]
