#!/usr/bin/env node

'use strict'

const url = require('url')

const fetch = require('./fetch')

const resolverConfig = require('../../config/resolvers.json')

// returns the pageID or template ID that matches
const getTemplateResolver = function getTemplateResolver (resolver) {
  return (resolver.page)
    ? (content) => ({
      type: 'page',
      id: resolver.page
    })
    : (content) => ({
      type: 'template',
      id: resolver.template
    })
}

const getResolverHydrater = function getResolverHydrater (resolver) {
  const templateResolver = getTemplateResolver(resolver)
  const contentResolver = (resolver.content)
    ? (requestUri) => fetch(resolver.content, {uri: encodeURIComponent(requestUri + '/')})
    : (requestUri) => Promise.resolve({requestUri, undefined, page: resolver._id})

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

// create page resolvers
const pageResolvers = resolverConfig
  .pages.map(resolver => Object.assign(resolver,
    {
      hydrate: getResolverHydrater(resolver),
      match: getResolverMatcher(resolver),
      type: 'page'
    }
  ))

// create template resolvers
const templateResolvers = resolverConfig
  .resolvers.map(resolver => Object.assign(resolver,
    {
      hydrate: getResolverHydrater(resolver),
      match: getResolverMatcher(resolver),
      type: 'template'
    }
  ))

const resolvers = pageResolvers.concat(templateResolvers)

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
