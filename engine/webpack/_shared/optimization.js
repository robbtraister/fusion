'use strict'

const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

const { minify } = require('../../environment')

module.exports = (minify)
  ? {
    optimization: {
      minimizer: [
        new UglifyWebpackPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          test: /\.[jt]sx?$/i
        })
      ]
    }
  }
  : {}
