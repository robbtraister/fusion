'use strict'

const { minify } = require('../../environment')

module.exports = (minify) ? 'production' : 'development'
