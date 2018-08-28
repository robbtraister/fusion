#!/usr/bin/env node

'use strict'

const url = require('url')

const debugLogger = require('debug')('fusion:resolver:logger')

const PageResolver = require('../models/resolvers/page-resolver')
const TemplateResolver = require('../models/resolvers/template-resolver')

const {
  resolveFromDB
} = require('../../environment')

const {
  trailingSlashRewrite
} = require('../utils/trailing-slash-rule')

// fetch page/template resolvers from DB (local env) or config file (prod)
const { pageConfigs, templateConfigs } = (resolveFromDB)
  ? (() => {
    const model = require('../dao')
    return {
      pageConfigs: model('page').find(),
      templateConfigs: model('resolver_config').find()
    }
  })()
  : (() => {
    const resolverConfigs = require('../../config/resolvers.json')
    return {
      pageConfigs: Promise.resolve(resolverConfigs.pages || []),
      templateConfigs: Promise.resolve(resolverConfigs.resolvers || [])
    }
  })()

const pageResolversPromise = pageConfigs
  .then((configs) => configs.map((config) => new PageResolver(config)))
  .then((resolvers) => resolvers.sort(PageResolver.sort))

const templateResolversPromise = templateConfigs
  .then((configs) => configs.map((config) => new TemplateResolver(config)))
  .then((resolvers) => resolvers.sort(TemplateResolver.sort))

const resolversPromise = Promise.all([
  pageResolversPromise,
  templateResolversPromise
])
  .then(([pageResolvers, templateResolvers]) => pageResolvers.concat(templateResolvers))

const resolve = function resolve (requestUri, arcSite, version) {
  const requestParts = url.parse(requestUri, true)
  requestParts.pathname = trailingSlashRewrite(requestParts.pathname)
  debugLogger(`Resolving: ${JSON.stringify(requestUri)}`)

  return resolversPromise
    .then((resolvers) => {
      const resolver = resolvers.find(resolver => resolver.match(requestParts, arcSite))

      return resolver
        ? resolver.resolve(requestParts, arcSite, version)
        : null
    })
}

module.exports = resolve

if (module === require.main) {
  resolve(process.argv[2])
    .then(console.log)
    .catch(console.error)
}
