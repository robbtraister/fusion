'use strict'

const crypto = require('crypto')
const path = require('path')

const { graphql, buildSchema, GraphQLSchema } = require('graphql')

const unpack = require('../../utils/unpack')

const { buildRoot } = require('../../../environment')

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

class BaseSource {
  constructor (name, config) {
    this.name = name
    this.config = config

    this.schema = null
    if (config.schemaName) {
      const schemaFile = path.resolve(buildRoot, 'content', 'schemas', config.schemaName)
      if (!(schemaFile in schemaCache)) {
        try {
          const schema = unpack(require(schemaFile))
          schemaCache[schemaFile] = (schema instanceof GraphQLSchema)
            ? schema
            : buildSchema(schema)
        } catch (err) {
          console.error(err)
          // do not throw error just because filtering is unavailable
          // throw err
        }
      }
      this.schema = schemaCache[schemaFile]
    }
  }

  appendId (data) {
    const idField = ID_FIELDS.find((idField) => data.hasOwnProperty(idField))
    data._id = (idField)
      ? data[idField]
      : crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    return data
  }

  async fetch (...args) {
    const { data, expires, lastModified } = await this.fetchImpl(...args)

    return {
      data: this.appendId(this.transform(data)),
      expires,
      lastModified
    }
  }

  getExpiration (date) {
    const timestamp = +(date || new Date())
    return timestamp + (this.ttl * 1000)
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
        // we don't need a full stacktrace to know the filter failed
        console.error(`Error filtering source [${this.name}]:`, err.message)
        return data
      }
    } else {
      return data
    }
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

  get ttl () {
    return Math.max(this.config.ttl || 300, 120)
  }
}

module.exports = BaseSource
