#!/usr/bin/env node

'use strict'

const url = require('url')

const fetch = require('./fetch')

const { trailingSlashRule, useDB } = require('../environment')

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

const enforceTrailingSlashRule = {
  NOOP: (uri) => uri,
  FORCE: (uri) => uri.replace(/\/[^./]+$/, (match) => `${match}/`),
  DROP: (uri) => uri.replace(/\/*$/, '')
}[trailingSlashRule]

const getTemplateResolver = function getTemplateResolver (resolver) {
  const getId = (resolver.type === 'page')
    ? (content) => resolver._id // Pages
    : (content) => { // Templates
      const contentPageMapping = resolver.content2pageMapping
      if (contentPageMapping) {
        const contentValue = getNestedValue(content, contentPageMapping.field)
        let template = contentPageMapping.mapping[contentValue] || resolver.page
        return template
      } else {
        return resolver.page
      }
    }

  return (content) => ({
    type: resolver.type,
    id: getId(content)
  })
}

const parseContentSourceParameters = function parseContentSourceParameters (resolver) {
  if (resolver.contentConfigMapping) {
    const mappers = Object.keys(resolver.contentConfigMapping).map(key => {
      const param = resolver.contentConfigMapping[key]
      return {
        parameter: (requestUri) => {
          const queryParams = url.parse(requestUri, true).query
          return {[key]: queryParams[param.name]}
        },
        pattern: (requestUri) => {
          // TODO optimize for multiple pattern params so we don't regex match each time
          const pattern = new RegExp(resolver.pattern)
          const groups = getUriPathname(requestUri).match(pattern)
          const uri = enforceTrailingSlashRule(groups[param.index])
          return {[key]: uri} // force trailing slash
        },
        static: () => ({[key]: param.value})
      }[param.type]
    })

    return (requestUri) => Object.assign(...mappers.map(mapper => mapper(requestUri)))
  }
  return () => null
}

const getResolverHydrater = function getResolverHydrater (resolver) {
  const templateResolver = getTemplateResolver(resolver)

  const contentSourceParser = parseContentSourceParameters(resolver)

  const contentResolver = (resolver.contentSourceId)
    ? (requestUri) => {
      const contentSourceParams = contentSourceParser(requestUri)
      requestUri = enforceTrailingSlashRule(requestUri)
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

// fetch page/template resolvers from DB (local env) or config file (prod)
const { pageConfigs, templateConfigs } = (useDB)
  ? (() => {
    const model = require('../dao/dao')
    return {
      pageConfigs: model('page').find(),
      templateConfigs: model('resolver_config').find()
    }
  })()
  : (() => {
    const resolverConfigs = require('../../config/resolvers.json')
    return {
      pageConfigs: Promise.resolve(resolverConfigs.pages),
      templateConfigs: Promise.resolve(resolverConfigs.resolvers)
    }
  })()

const pageResolvers = pageConfigs.then((configs) => {
  return configs.map((resolver) => {
    // resolver type needs to be set outside of Object.assign because the type value needs to be accessible when evaluating getResolverHydrater
    resolver.type = 'page'
    return Object.assign(resolver,
      {
        hydrate: getResolverHydrater(resolver),
        match: getResolverMatcher(resolver)
      })
  })
})

const templateResolvers = templateConfigs.then((configs) => {
  return configs.map((resolver) => {
    // resolver type needs to be set outside of Object.assign because the type value needs to be accessible when evaluating getResolverHydrater
    resolver.type = 'template'
    return Object.assign(resolver,
      {
        hydrate: getResolverHydrater(resolver),
        match: getResolverMatcher(resolver)
      })
  })
})

const resolversPromise = Promise.all([pageResolvers, templateResolvers]).then(([pageResolvers, templateResolvers]) => pageResolvers.concat(templateResolvers))

const resolve = function resolve (requestUri) {
  return resolversPromise.then(resolvers => {
    const resolver = resolvers.find(resolver => resolver.match(requestUri))
    return resolver
      ? resolver.hydrate(requestUri)
      : null
  })
}

module.exports = resolve

if (module === require.main) {
  resolve(process.argv[2])
    .then(console.log)
    .catch(console.error)
}
