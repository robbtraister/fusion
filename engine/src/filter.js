'use strict'

const { graphql } = require('graphql')

const getSchema = require('./schemas')

const getQuery = function getQuery (query) {
  return query
}

const filter = function filter (schemaName, ...args) {
  const filterQuery = function filterQuery (query, ...args) {
    const filterData = (query)
      ? (data) => graphql(getSchema(schemaName), getQuery(query), data)
        .then(result => {
          if (result.errors) {
            throw result.errors[0]
          }
          return result.data
        })
      : (data) => Promise.resolve(data)

    return (args.length === 0)
      ? filterData
      : filterData(...args)
  }

  return (args.length === 0)
    ? filterQuery
    : filterQuery(...args)
}

module.exports = filter

if (module === require.main) {
  filter(...process.argv.slice(2))
    .then(console.log)
    .catch(console.error)
}
