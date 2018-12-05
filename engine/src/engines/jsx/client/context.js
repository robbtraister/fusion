'use strict'

/* global Fusion */

const getRenderables = require('../../_shared/renderables')
const substitute = require('../../_shared/substitute')
const deployment = require('./deployment')

const lastModified = new Date(Fusion.lastModified || null).toUTCString()

const pageParams =
  (Fusion.deployment ? `&d=${Fusion.deployment}` : '') +
  (Fusion.arcSite ? `&_website=${encodeURIComponent(Fusion.arcSite)}` : '')

function fetch ({ filter, queryCache, queryString, source }) {
  filter = (filter)
    ? filter
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s+/g, ' ')
      .trim()
    : null

  const uri = `${Fusion.contextPath || ''}/api/v3/content/fetch/${source}?query=${encodeURIComponent(queryString)}` +
    (filter ? `&filter=${encodeURIComponent(filter)}` : '') +
    pageParams

  return window.fetch(
    uri,
    (queryCache && queryCache.data)
      ? {}
      : {
        headers: {
          'If-Modified-Since': queryCache.lastModified || lastModified
        }
      }
  )
    .then((resp) => {
      if (resp.status === 304) {
        return queryCache.data
      }
      return resp.json()
    })
    .catch((err) => {
      console.error(err)
      return queryCache.data
    })
}

function getContent ({ source, query, filter, inherit }) {
  const queryString = JSON.stringify(query)
  const sourceCache = Fusion.contentCache[source]
  if (sourceCache) {
    const queryCache = sourceCache[queryString]
    if (queryCache) {
      const now = +new Date()
      return {
        cached: queryCache.data,
        fetched: (queryCache.expires < now)
          ? fetch({ filter, queryCache, queryString, source })
          : Promise.resolve(queryCache.data)
      }
    }
  }
  return {
    fetched: fetch({ source, queryString, filter })
  }
}

module.exports = (rawTree) => {
  const props = {
    arcSite: Fusion.arcSite,
    contextPath: Fusion.contextPath,
    deployment,
    getProperties: Fusion.getProperties,
    globalContent: Fusion.globalContent,
    globalContentConfig: Fusion.globalContentConfig,
    isAdmin: !!Fusion.isAdmin,
    outputType: Fusion.outputType,
    siteProperties: Fusion.getProperties(Fusion.arcSite),
    template: Fusion.template
  }
  props.tree = substitute(
    rawTree,
    {
      ...props,
      // legacy API for hydration used `content.` to reference globalContent
      content: props.globalContent
    }
  )
  props.renderables = getRenderables(props.tree)
  props.layout = props.tree.type

  return {
    eventListeners: {},
    getContent,
    props
  }
}
