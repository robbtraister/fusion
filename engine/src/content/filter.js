#!/usr/bin/env node

'use strict'

const { graphql } = require('graphql')

const getSchema = require('./schemas')

const KEEP_FIELDS = ['id', '_id']

const filter = function filter (schemaName, ...args) {
  const schema = schemaName
    ? getSchema(schemaName)
    : null

  const filterData = (schema)
    ? (query, data) => {
      return (query && data)
        ? graphql(schema, query, data)
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
    : (query, data) => Promise.resolve(data)

  return (args.length === 0)
    ? filterData
    : filterData(...args)
}

module.exports = filter

if (module === require.main) {
  filter(...process.argv.slice(2))
    .then(console.log)
    .catch(console.error)
}
