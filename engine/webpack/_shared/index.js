'use strict'

module.exports = (env) => ({
  ...require('./mode')(env),
  ...require('./optimization')(env),
  ...require('./resolve')(env),
  ...require('./watch-options')(env)
})
