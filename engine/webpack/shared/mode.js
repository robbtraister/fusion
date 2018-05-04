'use strict'

const { isDev } = require('../../environment')

module.exports = (isDev) ? 'development' : 'production'
