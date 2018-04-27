'use strict'

const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

const { isDev } = require('../../src/environment')

const optimization = (isDev)
  ? {}
  : {
    minimizer: [new UglifyWebpackPlugin({
      test: /\.jsx?$/i
    })]
  }

module.exports = optimization
