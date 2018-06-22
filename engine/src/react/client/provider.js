'use strict'

/* global Fusion */

const React = require('react')

Fusion.context = React.createContext('fusion')
const now = +new Date()
const lastModified = new Date(Fusion.lastModified || null).toUTCString()

const JSONNormalize = require('../../utils/normalize')

const getContentGenerator = function getContentGenerator (contentCache) {
  contentCache = contentCache || {}

  return function getContent (source, ...args) {
    const sourceCache = contentCache[source] = contentCache[source] || {}

    const fetchContent = (source, keyString, filter, cached) =>
      window.fetch(
        `${Fusion.contextPath || ''}/api/v3/content/fetch/${source}?key=${encodeURIComponent(keyString)}` + (filter ? `&query=${encodeURIComponent(filter)}` : '') + (Fusion.arcSite ? `&_website=${encodeURIComponent(Fusion.arcSite)}` : ''),
        {
          headers: {
            'If-Modified-Since': lastModified
          }
        }
      )
        .then(resp => resp.json())
        .catch(() => cached)

    const getSourceContent = (key, filter) => {
      filter = filter ? filter.replace(/\s+/g, ' ').trim() : null

      const keyString = JSONNormalize.stringify(key)
      const keyCache = sourceCache.entries[keyString] = sourceCache.entries[keyString] || {}
      const cached = keyCache.cached

      keyCache.fetched = keyCache.fetched || {}
      const fetched = keyCache.fetched[filter] = keyCache.fetched[filter] || (
        (cached === undefined || sourceCache.expiresAt < now)
          ? fetchContent(source, keyString, filter, cached)
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

const value = {
  arcSite: Fusion.arcSite,
  contextPath: Fusion.contextPath,
  getContent: getContentGenerator(Fusion.contentCache),
  globalContent: Fusion.globalContent,
  outputType: Fusion.outputType,
  requestUri: window.location.pathname + window.location.search
}

module.exports = (props) => React.createElement(
  Fusion.context.Provider,
  {
    value: Object.assign(value, {isAdmin: props.isAdmin})
  },
  props.children
)
