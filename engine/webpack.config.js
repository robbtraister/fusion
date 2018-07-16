'use strict'

require('./mock-requires/client')

module.exports = [].concat(
  require('./webpack/engine'),
  require('./webpack/combinations'),
  require('./webpack/components'),
  require('./webpack/output-types')
)
