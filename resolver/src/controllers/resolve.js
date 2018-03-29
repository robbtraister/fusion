#!/usr/bin/env node

'use strict'

const url = require('url')

const fetch = require('./fetch')

const getTemplateResolver = function getTemplateResolver (resolver) {
  return (resolver.page)
    ? (content) => ({page: resolver.page})
    : (content) => ({template: resolver.template})
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
  const contentResolver = (resolver.content)
    ? (requestUri) => fetch(resolver.content, {uri: requestUri})
    : (requestUri) => Promise.resolve(null)

  return (requestUri) => contentResolver(requestUri)
    .then(content => Object.assign(
      {
        requestUri,
        content
      },
      templateResolver(content)
    ))
}

// const hydrate = function hydrate (resolver, ...args) {
//   const hydrater = getResolverHydrater(resolver)
//
//   return (args.length === 0)
//     ? hydrater
//     : hydrater(...args)
// }

const getUriPathname = function getUriPathname (requestUri) {
  return url.parse(requestUri).pathname
}

const getResolverMatcher = function getResolverMatcher (resolver) {
  if (resolver.uri) {
    return (requestUri) => resolver.uri === getUriPathname(requestUri)
  } else if (resolver.pattern) {
    const pattern = new RegExp(resolver.pattern)
    return (requestUri) => pattern.test(getUriPathname(requestUri))
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

const resolvers = require('../../config/resolvers.json')
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
