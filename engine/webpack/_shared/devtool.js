'use strict'

const { minify } = require('../../environment')

module.exports = {
  devtool: (minify) ? 'source-map' : 'eval-source-map'
}
