'use strict'

const { buildSchema, GraphQLSchema } = require('graphql')

const schemasRoot = process.env.SCHEMAS_ROOT || '../assets/content/schemas'

const schemas = {}
const getSchema = function getSchema (schemaName) {
  if (!(schemaName in schemas)) {
    const schema = require(`${schemasRoot}/${schemaName}`)

    schemas[schemaName] = (schema instanceof GraphQLSchema)
      ? schema
      : buildSchema(schema)
  }
  return schemas[schemaName]
}

module.exports = getSchema
