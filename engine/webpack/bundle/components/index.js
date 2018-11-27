'use strict'

module.exports =
  [].concat(
    require('./engines/hbs'),
    require('./engines/js'),
    require('./engines/jsx')
  )
