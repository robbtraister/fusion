'use strict'

const { buildSchema, GraphQLSchema } = require('graphql')

const { schemasDistRoot } = require('../../../environment')

const unpack = require('../../utils/unpack')

const schemaCache = {}
const getSchema = function getSchema (schemaName) {
  if (!(schemaName in schemaCache)) {
    try {
      const schema = unpack(require(`${schemasDistRoot}/${schemaName}`))

      schemaCache[schemaName] = (schema instanceof GraphQLSchema)
        ? schema
        : buildSchema(schema)
    } catch (err) {
      console.error(err)
      throw err
    }
  }
  return schemaCache[schemaName]
}

module.exports = getSchema
