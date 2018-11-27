'use strict'

const { isProd } = require('../../environment')

module.exports = (isProd)
  ? require('./aws')
  : require('./local')
