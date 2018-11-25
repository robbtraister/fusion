'use strict'

// const path = require('path')

module.exports = (env) => {
  // const { buildRoot } = env

  return function getSchemaConfig (schemaName) {
    // const schemaFile = path.resolve(buildRoot, 'content', 'schemas', schemaName)

    return {
      id: schemaName
    }
  }
}
