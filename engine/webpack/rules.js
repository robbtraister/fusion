'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { isDev } = require('../src/environment')

module.exports = [
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
  },
  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          minimize: !isDev
        }
      }
    ]
  },
  {
    test: /\.s[ac]ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          minimize: !isDev
        }
      },
      'sass-loader'
    ]
  }
]
