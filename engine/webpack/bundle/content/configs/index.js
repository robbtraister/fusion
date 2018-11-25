'use strict'

const schemaConfigGetter = require('./schemas')
const sourceConfigGetter = require('./sources')

module.exports = (env) => {
  return {
    schemas: schemaConfigGetter(env),
    sources: sourceConfigGetter(env)
  }
}
