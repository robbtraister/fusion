'use strict'

const { isDev } = require('../src/environment')

module.exports = (isDev) ? 'development' : 'production'
