#!/usr/bin/env node

'use strict'

const url = require('url')

const fetch = require('./fetch')

const resolverConfig = require('../../config/resolvers.json')

const getTemplateResolver = function getTemplateResolver (resolver) {
  return (resolver.type === 'page')
    ? (content) => ({page: resolver._id})
    : (content) => ({template: resolver.page})
}

const parseContentSourceParameters = function parseContentSourceParameters (resolver, requestUri) {
  const contentParams = {}
  Object.keys(resolver.contentConfigMapping).map(key => {
    const param = resolver.contentConfigMapping[key]
    if (param.type === 'pattern') {
      // TODO optimize for multiple pattern params so we don't regex match each time
      const pattern = new RegExp(resolver.pattern)
      let groups = getUriPathname(requestUri).match(pattern)
      contentParams[key] = groups[param.index] + '/'
    } else if (param.type === 'static') {
      contentParams[key] = param.value
    } else if (param.type === 'parameter') {
      var queryParams = url.parse(requestUri, true).query
      contentParams[key] = queryParams[param.name]
    }
  })
  console.log(contentParams)
  return contentParams
}

const getResolverHydrater = function getResolverHydrater (resolver) {
  const templateResolver = getTemplateResolver(resolver)

  // given contentSourceId, fetch content with JSON object of parameters

  const contentResolver = (resolver.contentSourceId)
    ? (requestUri) => {
      const contentSourceParams = parseContentSourceParameters(resolver, requestUri)
      return fetch(resolver.contentSourceId, Object.assign({'uri': requestUri + '/'}, contentSourceParams))
    }
    : (requestUri) => Promise.resolve(null)

  return (requestUri) => contentResolver(requestUri)
    .then(content => Object.assign(
      {
        requestUri,
        content
      },
      templateResolver(content)
    )
    )
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
    return (requestUri) => {
      console.log(requestUri + ' against ' + resolver._id + ' ' + pattern.test(getUriPathname(requestUri)))
      return pattern.test(getUriPathname(requestUri))
    }
  }
  return () => null
}

// create page resolvers
const pageResolvers = resolverConfig
  .pages.map(resolver => {
    Object.assign(resolver, {type: 'page'})
    return Object.assign(resolver,
      {
        hydrate: getResolverHydrater(resolver),
        match: getResolverMatcher(resolver)
      }
    )
  })

// create template resolvers
const templateResolvers = resolverConfig
  .resolvers.map(resolver => {
    Object.assign(resolver, {type: 'template'})
    return Object.assign(resolver,
      {
        hydrate: getResolverHydrater(resolver),
        match: getResolverMatcher(resolver)
      }
    )
  })

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
