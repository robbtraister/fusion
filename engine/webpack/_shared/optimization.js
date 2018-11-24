'use strict'

const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env) =>
  (env.minify)
    ? {
      minimizer: [new UglifyWebpackPlugin({
        parallel: true,
        sourceMap: true,
        test: /\.[jt]sx?$/i
      })]
    }
    : {}
