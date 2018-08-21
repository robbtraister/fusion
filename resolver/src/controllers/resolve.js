#!/usr/bin/env node

'use strict'

const url = require('url')

const fetch = require('./fetch')

const debugLogger = require('debug')('fusion:resolver:logger')

const { RedirectError } = require('../errors')

const {
  resolveFromDB
} = require('../../environment')

const {
  TRAILING_SLASH_REWRITES,
  trailingSlashRewrite
} = require('../utils/trailing-slash-rule')

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

const getRenderingResolver = function getRenderingResolver (resolver) {
  const getId = (resolver.type === 'page')
    ? (content) => resolver._id || resolver.id // Pages
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
          const uri = trailingSlashRewrite(groups[param.index])
          return {[key]: uri} // force trailing slash
        },
        static: () => ({[key]: param.value})
      }[param.type]
    })

    if (mappers.length) {
      return (requestUri) => Object.assign(...mappers.map(mapper => mapper(requestUri)))
    }
  }
  return () => null
}

const getResolverHydrater = function getResolverHydrater (resolver) {
  const renderingResolver = getRenderingResolver(resolver)

  const contentSourceParser = parseContentSourceParameters(resolver)

  const contentResolver = (resolver.contentSourceId)
    ? (requestUri, arcSite, version) => {
      const contentSourceParams = contentSourceParser(requestUri)
      requestUri = trailingSlashRewrite(requestUri)
      const key = Object.assign({'uri': requestUri, '_website': arcSite}, contentSourceParams)
      return fetch(resolver.contentSourceId, key, version)
        .then(content => ({key, content}))
    }
    : (requestUri, arcSite) => Promise.resolve({key: null, content: null})

  return (requestUri, arcSite) => contentResolver(requestUri, arcSite)
    .then(({content, key}) => Object.assign(
      {
        requestUri,
        rendering: renderingResolver(content)
      },
      resolver.contentSourceId
        ? {
          content: {
            source: resolver.contentSourceId,
            key,
            document: content
          }
        }
        : {}
    ))
}

const getUriPathname = function getUriPathname (requestUri) {
  return url.parse(requestUri).pathname
}

const getResolverMatcher = function getResolverMatcher (resolver) {
  const siteMatcher = (resolver.sites && resolver.sites.length)
    ? (arcSite) => resolver.sites.includes(arcSite)
    : () => true
  if (resolver.uri) { // pages
    return (pathname, arcSite) => (resolver.uri === pathname) && siteMatcher(arcSite)
  } else if (resolver.pattern) { // templates
    const params = resolver.params.map(param => ({
      name: param.name,
      pattern: new RegExp(param.value),
      required: !!param.required
    }))
    const requiredParams = params.filter(param => param.required)
    const optionalParams = params.filter(param => !param.required)
    const requiredParamsMatcher = (requestParams) => requiredParams.every(param => param.pattern.test(requestParams[param.name]))
    const optionalParamsMatcher = (requestParts) => {
      const queryParams = requestParts.query
      const mismatchParams = optionalParams.filter(param => ((param.name in queryParams) && !param.pattern.test(queryParams[param.name])))
        .map(param => param.name)

      if (mismatchParams.length > 0) {
        delete requestParts.search

        const query = {}
        Object.keys(requestParts.query)
          .filter(key => !mismatchParams.includes(key))
          .forEach(key => { query[key] = requestParts.query[key] })
        requestParts.query = query

        debugLogger(`Redirect issued: ${JSON.stringify(url.format(requestParts))}`)
        throw new RedirectError(url.format(requestParts))
      }
      return true
    }

    const queryParamMatcher = (requestParts) => (requiredParamsMatcher(requestParts.query) && optionalParamsMatcher(requestParts))

    const pattern = new RegExp(resolver.pattern) // the resolver URI pattern
    return (requestParts, arcSite) => pattern.test(requestParts.pathname) && queryParamMatcher(requestParts) && siteMatcher(arcSite)
  }
  return () => null
}

function sortOnSites (a, b) {
  if ((a.sites && a.sites.length) && !(b.sites && b.sites.length)) return -1
  if (!(a.sites && a.sites.length) && (b.sites && b.sites.length)) return 1
}

// fetch page/template resolvers from DB (local env) or config file (prod)
const { pageConfigs, templateConfigs } = (resolveFromDB)
  ? (() => {
    const model = require('../dao')
    return {
      pageConfigs: model('page').find(),
      templateConfigs: model('resolver_config').find()
        .then(configs => configs.sort((a, b) => +a.priority - +b.priority))
    }
  })()
  : (() => {
    const resolverConfigs = require('../../config/resolvers.json')
    return {
      pageConfigs: Promise.resolve(resolverConfigs.pages || []),
      templateConfigs: Promise.resolve(resolverConfigs.resolvers || [])
    }
  })()

const prepareResolver = (type) => (resolver) => {
  // resolver type needs to be set outside of Object.assign because the type value needs to be accessible when evaluating getResolverHydrater
  resolver.type = type
  return Object.assign(resolver,
    {
      hydrate: getResolverHydrater(resolver),
      match: getResolverMatcher(resolver)
    })
}

const pageResolvers = pageConfigs
  .then((configs) => {
    const preparer = prepareResolver('page')
    return configs
      // strip trailing slashes
      .map(config => Object.assign(config, {uri: TRAILING_SLASH_REWRITES.DROP(config.uri)}))
      .map(preparer)
      .sort(sortOnSites)
  })
const templateResolvers = templateConfigs.then((configs) => configs.map(prepareResolver('template')))

const resolve = function resolve (requestUri, arcSite, version) {
  const requestParts = url.parse(requestUri, true)
  const pathname = requestParts.pathname
  debugLogger(`Resolving: ${JSON.stringify(requestUri)}`)

  return Promise.all([pageResolvers, templateResolvers])
    .then(([pageResolvers, templateResolvers]) => {
      const normalizedPathname = TRAILING_SLASH_REWRITES.DROP(pathname)
      const resolver = pageResolvers.find(resolver => resolver.match(normalizedPathname, arcSite)) ||
        templateResolvers.find(resolver => resolver.match(requestParts, arcSite))

      return resolver
        ? resolver.hydrate(requestUri, arcSite, version)
        : null
    })
}

module.exports = resolve

if (module === require.main) {
  resolve(process.argv[2])
    .then(console.log)
    .catch(console.error)
}
