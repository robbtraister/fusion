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

async function loadResolvers () {
  let pageConfigs
  let templateConfigs

  if (resolveFromDB) {
    const model = require('../dao')
    ;[ pageConfigs, templateConfigs ] = await Promise.all([
      model('page').find(),
      model('resolver_config').find()
    ])
  } else {
    const resolverConfigs = require('../../config/resolvers.json')
    ;[ pageConfigs, templateConfigs ] = await Promise.all([
      resolverConfigs.pages || [],
      resolverConfigs.resolvers || []
    ])
  }

  const pageResolvers = pageConfigs
    .map((config) => new PageResolver(config))
    .sort(PageResolver.sort)

  const templateResolvers = templateConfigs
    .map((config) => new TemplateResolver(config))
    .sort(TemplateResolver.sort)

  return pageResolvers.concat(templateResolvers)
}

const resolversPromise = loadResolvers()

const resolve = async function resolve (requestUri, arcSite, version) {
  const requestParts = url.parse(requestUri, true)
  requestParts.pathname = trailingSlashRewrite(requestParts.pathname)
  debugLogger(`Resolving: ${JSON.stringify(requestUri)}`)

  const resolvers = await resolversPromise
  const resolver = resolvers.find(resolver => resolver.match(requestParts, arcSite))

  return resolver
    ? resolver.resolve(requestParts, arcSite, version)
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
