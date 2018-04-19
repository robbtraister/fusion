#!/usr/bin/env node

'use strict'

const url = require('url')

const fetch = require('./fetch')

const resolverConfig = require('../../config/resolvers.json')

const { forceTrailingSlash } = require('../environment')

const getNestedValue = function getNestedValue (target, field) {
  const keys = (field || '').split('.')
  let value = target
  while (keys.length) {
    target = value || {}
    const key = keys.shift()
    value = target[key]
  }
  return value
}

const getTemplateResolver = function getTemplateResolver (resolver) {
  return (resolver.type === 'page') ? (content) => ({page: resolver._id}) // Pages
    : (content) => { // Templates
      const contentPageMapping = resolver.content2pageMapping
      if (contentPageMapping) {
        const contentValue = getNestedValue(content, contentPageMapping.field)
        let template = contentPageMapping.mapping[contentValue] || resolver.page
        return {template}
      } else {
        return {template: resolver.page}
      }
    }
}

const parseContentSourceParameters = function parseContentSourceParameters (resolver, requestUri) {
  const contentParams = Object.assign(...Object.keys(resolver.contentConfigMapping).map(key => {
    const param = resolver.contentConfigMapping[key]
    return {
      parameter: (requestUri) => {
        const queryParams = url.parse(requestUri, true).query
        return {[key]: queryParams[param.name]}
      },
      pattern: (requestUri) => {
        // TODO optimize for multiple pattern params so we don't regex match each time
        const pattern = new RegExp(resolver.pattern)
        let groups = getUriPathname(requestUri).match(pattern)
        return {[key]: groups[param.index].replace(/\/*$/, '/')} // force trailing slash
      },
      static: () => ({[key]: param.value})
    }[param.type](requestUri)
  }))
  return contentParams
}

const getResolverHydrater = function getResolverHydrater (resolver) {
  const templateResolver = getTemplateResolver(resolver)

  const contentResolver = (resolver.contentSourceId)
    ? (requestUri) => {
      const contentSourceParams = parseContentSourceParameters(resolver, requestUri)
      requestUri = forceTrailingSlash ? requestUri.replace(/\/*$/, '/') : requestUri
      return fetch(resolver.contentSourceId, Object.assign({'uri': requestUri}, contentSourceParams))
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
