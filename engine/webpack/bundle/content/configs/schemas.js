'use strict'

// const path = require('path')

// const { buildRoot } = require('../../../../environment')

module.exports = function getSchemaConfig (schemaName) {
  // const schemaFile = path.resolve(buildRoot, 'content', 'schemas', schemaName)

  return {
    id: schemaName
  }
}
