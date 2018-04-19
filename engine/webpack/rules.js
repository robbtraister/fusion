'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
      'css-loader'
    ]
  },
  {
    test: /\.s[ac]ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'sass-loader'
    ]
  }
]
