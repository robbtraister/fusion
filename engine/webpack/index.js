'use strict'

const env = require('../environment')

module.exports = [].concat(
  require('./bundle')(env),
  require('./engine')(env)
)
  .filter((config) => (config && config.entry && Object.keys(config.entry).length))
