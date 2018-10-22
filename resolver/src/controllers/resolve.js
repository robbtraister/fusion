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

function prepareResolverConfigs (pageConfigs, templateConfigs) {
  const pageResolvers = pageConfigs
    .map((config) => new PageResolver(config))
    .sort(PageResolver.sort)

  const templateResolvers = templateConfigs
    .map((config) => new TemplateResolver(config))
    .sort(TemplateResolver.sort)

  return pageResolvers.concat(templateResolvers)
}

function loadResolversFromDB () {
  const model = require('../dao')

  return async function () {
    const [ pageConfigs, templateConfigs ] = await Promise.all([
      model('page').find(),
      model('resolver_config').find()
    ])

    return prepareResolverConfigs(pageConfigs, templateConfigs)
  }
}

function loadResolversFromFS () {
  const resolverConfigs = require('../../config/resolvers.json')

  const resolverPromise = Promise.all([
    resolverConfigs.pages || [],
    resolverConfigs.resolvers || []
  ])
    .then(([pageConfigs, templateConfigs]) => prepareResolverConfigs(pageConfigs, templateConfigs))

  return async function () {
    return resolverPromise
  }
}

const getResolvers = (resolveFromDB)
  ? loadResolversFromDB()
  : loadResolversFromFS()

const resolve = async function resolve (requestUri, { arcSite, version, cacheMode }) {
  const requestParts = url.parse(requestUri, true)
  requestParts.pathname = trailingSlashRewrite(requestParts.pathname)
  debugLogger(`Resolving: ${JSON.stringify(requestUri)}`)

  const resolvers = await getResolvers()
  const resolver = resolvers.find(resolver => resolver.match(requestParts, arcSite))

  return resolver
    ? resolver.resolve(requestParts, { arcSite, version, cacheMode })
    : null
}

module.exports = resolve

async function main (uri) {
  try {
    console.log(await resolve(uri))
  } catch (e) {
    console.error(e)
  }
}

if (module === require.main) {
  main(process.argv[2])
}
