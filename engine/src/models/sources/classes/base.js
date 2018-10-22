'use strict'

const crypto = require('crypto')

const { graphql, buildSchema, GraphQLSchema } = require('graphql')

const { schemasBuildRoot } = require('../../../../environment')

const unpack = require('../../../utils/unpack')

// keep these in priority order
// `_id` is ahead of `id` because we set it to `_id`
const ID_FIELDS = [
  '_id',
  'id',
  'uuid',
  'guid'
]
const KEEP_FIELDS = ID_FIELDS.concat([])

const schemaCache = {}
const getSchema = function getSchema (schemaName) {
  if (!(schemaName in schemaCache)) {
    try {
      const schema = unpack(require(`${schemasBuildRoot}/${schemaName}`))

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
    this.config = config || {}

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
  }

  appendId (data) {
    const idField = ID_FIELDS.find((idField) => data.hasOwnProperty(idField))
    data._id = (idField)
      ? data[idField]
      : crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    return data
  }

  async clear (query) {
    throw new Error('`clear` not implemented')
  }

  async fetch (query, options) {
    throw new Error('`fetch` not implemented')
  }

  async filter (filter, data) {
    if (this.schema && filter && data) {
      try {
        const result = await graphql(this.schema, filter, data)

        if (result.errors) {
          throw result.errors[0]
        }

        KEEP_FIELDS.forEach((field) => {
          if (data[field]) {
            result.data[field] = data[field]
          }
        })

        return result.data
      } catch (err) {
        console.error(err)
        return data
      }
    } else {
      return data
    }
  }

  resolve (query, options) {
    return new Error('`resolve` not implemented')
  }

  transform (data) {
    const transformed = (this.config.transform instanceof Function)
      ? this.config.transform(data)
      : data

    const idField = ID_FIELDS.find((idField) => transformed.hasOwnProperty(idField))
    transformed._id = (idField)
      ? transformed[idField]
      : crypto.createHash('sha256').update(JSON.stringify(transformed)).digest('hex')

    return transformed
  }

  async update (query) {
    throw new Error('`update` not implemented')
  }
}

module.exports = Source
