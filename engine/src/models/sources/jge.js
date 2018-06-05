'use strict'

const model = require('../../dao')

const getSourceConfig = function getSourceConfig (sourceName) {
  return model('jge_config').get(sourceName)
}

module.exports = getSourceConfig
