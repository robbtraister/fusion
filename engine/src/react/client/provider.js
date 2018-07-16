'use strict'

/* global Fusion */

const React = require('react')

Fusion.context = React.createContext('fusion')
const now = +new Date()
const lastModified = new Date(Fusion.lastModified || null).toUTCString()

const JSONNormalize = require('../../utils/normalize')

const fetchContent = (sourceName, keyString, filter, cached) =>
  window.fetch(
    `${Fusion.contextPath || ''}/api/v3/content/fetch/${sourceName}?key=${encodeURIComponent(keyString)}` + (filter ? `&query=${encodeURIComponent(filter)}` : '') + (Fusion.arcSite ? `&_website=${encodeURIComponent(Fusion.arcSite)}` : ''),
    {
      headers: {
        'If-Modified-Since': lastModified
      }
    }
  )
    .then(resp => (resp.status === 304)
      ? cached
      : resp.json()
    )
    .catch(() => cached)

const getContentGenerator = function getContentGenerator (contentCache) {
  contentCache = contentCache || {}

  return function getContent (sourceName, ...args) {
    const sourceCache = contentCache[sourceName] = contentCache[sourceName] || {
      entries: {},
      expiresAt: 0
    }

    const getSourceContent = (key, filter) => {
      filter = (filter)
        ? filter
          .replace(/\s+/g, ' ')
          .replace(/ *{ */g, '{')
          .replace(/ *} */g, '}')
          .replace(/ *, */g, ',')
          .trim()
        : null

      const keyString = JSONNormalize.stringify(key)
      const keyCache = sourceCache.entries[keyString] = sourceCache.entries[keyString] || {}
      const cached = keyCache.cached

      keyCache.fetched = keyCache.fetched || {}
      const fetched = keyCache.fetched[filter] = keyCache.fetched[filter] || (
        (cached === undefined || sourceCache.expiresAt < now)
          ? fetchContent(sourceName, keyString, filter, cached)
          : Promise.resolve(cached)
      )

      try {
        return {
          cached,
          fetched
        }
      } catch (e) {
        return null
      }
    }

    return (args.length === 0)
      ? getSourceContent
      : getSourceContent.apply(this, args)
  }
}

const contextMatch = (Fusion.contextPath) ? window.location.pathname.match(`^${Fusion.contextPath}(.*)`) : null
const requestPath = (contextMatch) ? contextMatch[1] : window.location.pathname

const value = {
  arcSite: Fusion.arcSite,
  contextPath: Fusion.contextPath,
  eventListeners: {},
  getContent: getContentGenerator(Fusion.contentCache),
  globalContent: Fusion.globalContent,
  outputType: Fusion.outputType,
  requestUri: requestPath + window.location.search,
  variables: Fusion.variables(Fusion.arcSite)
}

module.exports = (props) => React.createElement(
  Fusion.context.Provider,
  {
    value: Object.assign(value, {isAdmin: props.isAdmin})
  },
  props.children
)
