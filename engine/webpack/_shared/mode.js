'use strict'

const { minify } = require('../../environment')

module.exports = {
  mode: (minify) ? 'production' : 'development'
}
