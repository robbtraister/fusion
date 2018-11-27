'use strict'

module.exports = [].concat(
  require('./bundle'),
  require('./engine')
)
  .filter((config) => (config && config.entry && Object.keys(config.entry).length))
