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
    const pattern = new RegExp(resolver.pattern)

    const params = Object.keys(resolver.contentConfigMapping)
      .map(key => Object.assign({key}, resolver.contentConfigMapping[key]))

    const hasPatternParam = !!params.find(param => param.type === 'pattern')

    if (params.length) {
      return (requestParts) => {
        const groups = (hasPatternParam)
          ? requestParts.pathname.match(pattern)
          : {}

        return Object.assign({},
          ...params.map(param => {
            const mapper = {
              parameter: (requestParts) => ({[param.key]: requestParts.query[param.name]}),
              pattern: (requestParts) => ({[param.key]: groups[param.index]}),
              static: () => ({[param.key]: param.value})
            }[param.type]
            return mapper && mapper(requestParts)
          })
        )
      }
    }
  }
  return () => null
}

const getResolverHydrater = function getResolverHydrater (resolver) {
  const renderingResolver = getRenderingResolver(resolver)

  const contentSourceParser = parseContentSourceParameters(resolver)

  const contentResolver = (resolver.contentSourceId)
    ? (requestParts, arcSite, version) => {
      const key = contentSourceParser(requestParts)
      return fetch(resolver.contentSourceId, key, arcSite, version)
        .then(content => ({key, content}))
    }
    : (requestUri, arcSite) => Promise.resolve({key: null, content: null})

  return (requestParts, arcSite) => contentResolver(requestParts, arcSite)
    .then(({content, key}) => Object.assign(
      {
        // keep requestUri temporarily for backwards compatibility
        requestUri: requestParts.href,
        request: {
          uri: requestParts.href,
          path: requestParts.pathname,
          query: requestParts.query
        },
        rendering: renderingResolver(content),
        resolver: Object.assign({}, resolver, {versions: undefined})
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
  requestParts.pathname = trailingSlashRewrite(requestParts.pathname)
  debugLogger(`Resolving: ${JSON.stringify(requestUri)}`)

  return Promise.all([pageResolvers, templateResolvers])
    .then(([pageResolvers, templateResolvers]) => {
      const normalizedPathname = TRAILING_SLASH_REWRITES.DROP(requestParts.pathname)
      const resolver = pageResolvers.find(resolver => resolver.match(normalizedPathname, arcSite)) ||
        templateResolvers.find(resolver => resolver.match(requestParts, arcSite))

      return resolver
        ? resolver.hydrate(requestParts, arcSite, version)
        : null
    })
}

module.exports = resolve

if (module === require.main) {
  resolve(process.argv[2])
    .then(console.log)
    .catch(console.error)
}
