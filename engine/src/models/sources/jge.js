'use strict'

const model = require('../../dao')
const SourceConfig = model('jge_config')

const getSourceConfig = function getSourceConfig (sourceName) {
  return SourceConfig.get(sourceName)
}

module.exports = getSourceConfig
