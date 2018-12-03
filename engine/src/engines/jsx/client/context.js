'use strict'

/* global Fusion */

const getRenderables = require('../../_shared/renderables')
const substitute = require('../../_shared/substitute')
const deployment = require('./deployment')

const lastModified = new Date(Fusion.lastModified || null).toUTCString()

const isUnchanged = ({ status }) => status === 304

function fetch ({ cached, filter, queryString, source }) {
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
    (Fusion.deployment ? `&d=${Fusion.deployment}` : '') +
    (Fusion.arcSite ? `&_website=${encodeURIComponent(Fusion.arcSite)}` : '')

  return window.fetch(
    uri,
    {
      headers: {
        'If-Modified-Since': lastModified
      }
    }
  )
    .then((resp) => {
      if (isUnchanged(resp)) {
        // use cache
        throw resp
      }
      return resp.json()
    })
}

function getContent ({ source, query, filter, inherit }) {
  const queryString = JSON.stringify(query)
  const sourceCache = Fusion.contentCache[source]
  if (sourceCache) {
    const queryCache = sourceCache.entries[queryString]
    const cached = queryCache && queryCache.cached
    const now = +new Date()

    return {
      cached,
      fetched: (sourceCache.expiresAt < now)
        ? fetch({ source, queryString, filter, cached })
          .catch((err) => {
            if (!isUnchanged(err)) {
              console.error(err)
            }
            return cached
          })
        : Promise.resolve(cached)
    }
  } else {
    return {
      fetched: fetch({ source, queryString, filter })
        .catch((err) => {
          if (!isUnchanged(err)) {
            console.error(err)
          }
        })
    }
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
