'use strict'

const { isProd } = require('../env')

const mode = isProd ? 'production' : 'development'

module.exports = mode
