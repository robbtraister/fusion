#!/usr/bin/env node

'use strict'

const resolvers = require('./resolvers.json')
  .map(resolver => Object.assign(resolver, resolver.pattern ? {pattern: new RegExp(resolver.pattern)} : {}))

const fetch = require('./fetch')

const resolve = function resolve (uri) {
  const match = function match (resolver) {
    return resolver.uri ? resolver.uri === uri
      : resolver.pattern ? resolver.pattern.test(uri)
      : null
  }

  const inflate = function inflate (resolver) {
    const getTemplate = function getTemplate (content) {
      return resolver.template
    }

    return fetch(resolver.content, uri)
      .then(content => ({
        content,
        template: getTemplate(content)
      }))
  }

  const resolver = resolvers.find(match)

  return resolver
    ? inflate(resolver)
    : Promise.resolve(null)
}

module.exports = resolve

if (module === require.main) {
  resolve(process.argv[2])
    .then(console.log)
    .catch(console.error)
}
