#!/usr/bin/env node

'use strict'

const fetch = require('./fetch')

const hydrate = function hydrate (resolver, ...args) {
  const getTemplate = function getTemplate (content) {
    return resolver.template
  }

  const hydrateUri = function hydrateUri (requestUri) {
    return fetch(resolver.content, requestUri)
      .then(content => ({
        requestUri,
        content,
        template: getTemplate(content)
      }))
  }

  return (args.length === 0)
    ? hydrateUri
    : hydrateUri(...args)
}

const match = function match (resolver, ...args) {
  const matchUri =
      resolver.uri ? (requestUri) => resolver.uri === requestUri
    : resolver.pattern ? (
      () => {
        const pattern = new RegExp(resolver.pattern)
        return (requestUri) => pattern.test(requestUri)
      })()
    : () => null

  return (args.length === 0)
    ? matchUri
    : matchUri(...args)
}

const resolvers = require('./resolvers.json')
  .map(resolver => Object.assign(resolver,
    {
      hydrate: hydrate(resolver),
      match: match(resolver)
    }
  ))

const resolve = function resolve (requestUri) {
  const resolver = resolvers.find(resolver => resolver.match(requestUri))

  return resolver
    ? resolver.hydrate(requestUri)
    : Promise.resolve(null)
}

module.exports = resolve

if (module === require.main) {
  resolve(process.argv[2])
    .then(console.log)
    .catch(console.error)
}
