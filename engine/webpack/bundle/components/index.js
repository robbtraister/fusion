'use strict'

module.exports = (env) =>
  [].concat(
    require('./engines/hbs')(env),
    require('./engines/js')(env),
    require('./engines/jsx')(env)
  )
