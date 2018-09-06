'use strict'

const { graphql, buildSchema, GraphQLSchema } = require('graphql')

const { schemasDistRoot } = require('../../../../environment')

const unpack = require('../../../utils/unpack')

const KEEP_FIELDS = ['id', '_id']

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

class Source {
  constructor (name, config) {
    this.name = name
    this.config = config

    this.pattern = config.pattern
    this.schemaName = config.schemaName

    if (config.params) {
      this.params = (config.params instanceof Object && !(config.params instanceof Array))
        ? Object.keys(config.params)
          .map((name) => ({
            name,
            type: config.params[name]
          }))
        : config.params

      if (this.params) {
        this.params.forEach((p) => { p.displayName = p.displayName || p.name })
      }
    }

    this.schema = this.schemaName
      ? getSchema(this.schemaName)
      : null

    if (config.transform && config.transform instanceof Function) {
      this.transform = config.transform.bind(this)
    }
  }

  async clear (key) {
    throw new Error('`clear` not implemented')
  }

  async fetch (key) {
    throw new Error('`fetch` not implemented')
  }

  async filter (query, data) {
    return (this.schema && query && data)
      ? graphql(this.schema, query, data)
        .then(result => {
          if (result.errors) {
            throw result.errors[0]
          }

          KEEP_FIELDS.forEach((field) => {
            if (data[field]) {
              result.data[field] = data[field]
            }
          })

          return result.data
        })
      : Promise.resolve(data)
  }

  resolve (key) {
    return new Error('`resolve` not implemented')
  }

  transform (data) {
    return data
  }

  async update (key) {
    throw new Error('`update` not implemented')
  }
}

module.exports = Source
