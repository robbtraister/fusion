'use strict'

const {
  isDev
} = require('../../environment')

module.exports = (isDev)
  ? require('./local')
  : require('./aws')
