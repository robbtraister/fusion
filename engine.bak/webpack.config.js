'use strict'

require('./mock-requires/client')

module.exports = [].concat(
  require('./webpack/engine'),
  require('./webpack/combinations'),
  require('./webpack/components'),
  require('./webpack/content'),
  require('./webpack/environment'),
  require('./webpack/output-types')
)
