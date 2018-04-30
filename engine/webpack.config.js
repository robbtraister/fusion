'use strict'

module.exports = [].concat(
  require('./webpack/engine'),
  require('./webpack/components'),
  require('./webpack/combined'),
  require('./webpack/output-types')
)
