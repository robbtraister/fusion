'use strict'

const {
  isDev
} = require('../../environment')

module.exports = (isDev)
  ? require('./mongo')
  : require('./dynamoose')
