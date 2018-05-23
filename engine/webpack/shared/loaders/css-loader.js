'use strict'

const { minify } = require('../../../environment')

module.exports = {
  loader: 'css-loader',
  options: {
    minimize: minify,
    url: false
  }
}
