'use strict'

const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

const { minify } = require('../../environment')

const optimization = (minify)
  ? {}
  : {
    minimizer: [new UglifyWebpackPlugin({
      test: /\.jsx?$/i
    })]
  }

module.exports = optimization
