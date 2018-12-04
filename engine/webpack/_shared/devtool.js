'use strict'

const { minify } = require('../../environment')

module.exports = {
  devtool: (minify) ? undefined : 'eval-source-map'
}
