'use strict'

/* global Fusion */

const React = require('react')

Fusion.context = React.createContext('fusion')
const now = +new Date()
const lastModified = new Date(Fusion.lastModified || null).toUTCString()

const JSONNormalize = require('../../utils/normalize')

const fetchContent = (sourceName, queryString, filter, cached) => {
  return window.fetch(
    `${Fusion.contextPath || ''}/api/v3/content/fetch/${sourceName}?query=${encodeURIComponent(queryString)}` + (filter ? `&query=${encodeURIComponent(filter)}` : '') + (Fusion.arcSite ? `&_website=${encodeURIComponent(Fusion.arcSite)}` : ''),
    {
      headers: {
        'If-Modified-Since': lastModified
      }
    }
  )
    .then((resp) =>
      (resp.status === 304)
        ? cached
        : resp.json()
    )
    .catch(() => cached)
}

const getContentGenerator = function getContentGenerator (contentCache) {
  contentCache = contentCache || {}

  return function getContent (sourceName, ...args) {
    const sourceCache = contentCache[sourceName] = contentCache[sourceName] || {
      entries: {},
      expiresAt: 0
    }

    const getSourceContent = (query, filter) => {
      filter = (filter)
        ? filter
          .replace(/\s+/g, ' ')
          .replace(/ *{ */g, '{')
          .replace(/ *} */g, '}')
          .replace(/ *, */g, ',')
          .trim()
        : null

      const queryString = JSONNormalize.stringify(query)
      const queryCache = sourceCache.entries[queryString] = sourceCache.entries[queryString] || {}
      const cached = queryCache.cached

      queryCache.fetched = queryCache.fetched || {}
      const fetched = queryCache.fetched[filter] = queryCache.fetched[filter] || (
        (cached === undefined || sourceCache.expiresAt < now)
          ? fetchContent(sourceName, queryString, filter, cached)
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
