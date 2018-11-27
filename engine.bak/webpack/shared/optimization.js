'use strict'

const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

const { minify } = require('../../environment')

const optimization = (minify)
  ? {
    minimizer: [new UglifyWebpackPlugin({
      parallel: true,
      sourceMap: true,
      test: /\.[jt]sx?$/i
    })]
  }
  : {}

module.exports = optimization