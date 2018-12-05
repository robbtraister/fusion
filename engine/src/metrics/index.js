'use strict'

const {
  isProd
} = require('../../environment')

module.exports = (isProd)
  ? require('./datadog')
  : require('./local')
