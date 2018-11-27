'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { minify } = require('../../../environment')

module.exports = {
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        minimize: minify,
        url: false
      }
    }
  ]
}
