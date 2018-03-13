#!/usr/bin/env node

'use strict'

const fetch = require('./fetch')

const getTemplateResolver = function getTemplateResolver (resolver) {
  return (content) => resolver.template
}

// const getTemplate = function getTemplate (resolver, ...args) {
//   const templateResolver = getTemplateResolver(resolver)
//
//   return (args.length === 0)
//     ? templateResolver
//     : templateResolver(...args)
// }

const getResolverHydrater = function getResolverHydrater (resolver) {
  const templateResolver = getTemplateResolver(resolver)
  return (requestUri) => fetch(resolver.content, requestUri)
    .then(content => ({
      requestUri,
      content,
      template: templateResolver(content)
    }))
}

// const hydrate = function hydrate (resolver, ...args) {
//   const hydrater = getResolverHydrater(resolver)
//
//   return (args.length === 0)
//     ? hydrater
//     : hydrater(...args)
// }

const getResolverMatcher = function getResolverMatcher (resolver) {
  if (resolver.uri) {
    return (requestUri) => resolver.uri === requestUri
  } else if (resolver.pattern) {
    const pattern = new RegExp(resolver.pattern)
    return (requestUri) => pattern.test(requestUri)
  }
  return () => null
}

// const match = function match (resolver, ...args) {
//   const matcher = getResolverMatcher(resolver)
//
//   return (args.length === 0)
//     ? matcher
//     : matcher(...args)
// }

const resolvers = require('../config/resolvers.json')
  .map(resolver => Object.assign(resolver,
    {
      // getTemplate: getTemplateResolver(resolver),
      hydrate: getResolverHydrater(resolver),
      match: getResolverMatcher(resolver)
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
