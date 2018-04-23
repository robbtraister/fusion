'use strict'

/* global Fusion */

const React = require('react')

const JSONNormalize = require('../../utils/normalize')

const getContentGenerator = function getContentGenerator (contentCache) {
  return function getContent (source, ...args) {
    const sourceCache = contentCache[source] || {}

    const fetchContent = (source, keyString, filter, cached) =>
      window.fetch(`/${(Fusion.prefix || '').replace(/^\/+/, '/').replace(/\/+$/, '')}/api/v3/content/${source}?key=${keyString}` + (filter ? `&query=${filter}` : ''))
        .then(resp => resp.json())
        .catch(() => cached)

    const getSourceContent = (key, filter) => {
      filter = filter ? filter.replace(/\s+/g, ' ').trim() : null

      const keyString = JSONNormalize.stringify(key)
      const keyCache = sourceCache[keyString] = sourceCache[keyString] || {}
      const cached = keyCache.cached

      keyCache.fetched = keyCache.fetched || {}
      const fetched = keyCache.fetched[filter] = keyCache.fetched[filter] || (
        (Fusion.refreshContent || cached === undefined)
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

module.exports = (props) => React.createElement(
  Fusion.context.Provider,
  {
    value: {
      getContent: getContentGenerator(Fusion.contentCache),
      globalContent: Fusion.globalContent,
      requestUri: window.location.pathname + window.location.search
    }
  },
  props.children
)
