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
      : getSourceContent(...args)
  }
}

const contextMatch = (Fusion.contextPath) ? window.location.pathname.match(`^${Fusion.contextPath}(.*)`) : null
const requestPath = (contextMatch) ? contextMatch[1] : window.location.pathname

module.exports = ({ children, ...props }) => React.createElement(
  Fusion.context.Provider,
  {
    value: {
      eventListeners: {},
      getContent: getContentGenerator(Fusion.contentCache),
      props: {
        arcSite: Fusion.arcSite,
        contextPath: Fusion.contextPath,
        globalContent: Fusion.globalContent,
        globalContentConfig: Fusion.globalContentConfig,
        // layout: <!-- provided by the render props -->
        outputType: Fusion.outputType,
        requestUri: requestPath + window.location.search,
        siteProperties: Fusion.properties(Fusion.arcSite),
        // template: <!-- provided by the render props -->
        ...props
      }
    }
  },
  children
)

module.exports.displayName = 'FusionApp'
