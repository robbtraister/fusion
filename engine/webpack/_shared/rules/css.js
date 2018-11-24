'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env) => ({
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        minimize: env.minify,
        url: false
      }
    }
  ]
})
