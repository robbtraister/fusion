'use strict'

const { buildSchema, GraphQLSchema } = require('graphql')

const { schemasRoot } = require('../../environment')

const schemaCache = {}
const getSchema = function getSchema (schemaName) {
  if (!(schemaName in schemaCache)) {
    try {
      const schema = require(`${schemasRoot}/${schemaName}`)

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
