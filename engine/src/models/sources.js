'use strict'

const model = require('./dao')
const SourceConfig = model('jge_config')

const getSourceConfig = function getSourceConfig (sourceName) {
  return SourceConfig.findById(sourceName)
}

module.exports = {
  getSourceConfig
}
