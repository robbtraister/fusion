'use strict'

const _ = require('lodash')
const React = require('react')

const JSONNormalize = require('../../utils/normalize')

const getSource = require('../../content/sources')

const getContentGenerator = function getContentGenerator (contentCache) {
  contentCache = contentCache || {}

  return function getContent (sourceName, ...args) {
    const sourceCache = contentCache[sourceName] = contentCache[sourceName] || {}
    const sourcePromise = getSource(sourceName)

    const getSourceContent = (key, query) => {
      // alphabetize object keys to ensure proper cacheing
      const keyString = JSONNormalize.stringify(key)
      const keyCache = sourceCache[keyString] = sourceCache[keyString] || {
        cached: undefined,
        filtered: undefined,
        fetched: sourcePromise
          .then(source => {
            keyCache.source = source
            return source.fetch(key)
          })
          .then(data => { keyCache.cached = data })
          .catch(() => { keyCache.cached = null })
          .then(() => keyCache.cached),
        source: undefined
      }

      keyCache.fetched = keyCache.fetched
        .then(data => (query && keyCache.source && keyCache.source.schemaName)
          ? keyCache.source.filter(query, data)
          : data
        )
        .then(filtered => {
          keyCache.filtered = keyCache.cached ? _.merge(keyCache.filtered, filtered) : null
          return keyCache.cached
        })

      // Server-side, we never need to worry about the Promise or async content
      // we will re-render using the cached content if necessary
      return keyCache // || keyCache.fetched
    }

    return (args.length === 0)
      ? getSourceContent
      : getSourceContent(...args)
  }
}

// Fusion context is shared by all components, both those pre-compiled and those generated at runtime
// If it is included in compiled components, they will each have a different instance on context
// In order to have them all access the same in-memory object, we need to provide it globally at runtime
// This single FusionContext object will be shared by all renders, but the value will be overridden by each Provider element
const FusionContext = React.createContext('fusion')
global.Fusion = {
  context: FusionContext
}

module.exports = (Template) => {
  const contentCache = {}
  const wrapper = (props) => React.createElement(
    FusionContext.Provider,
    {
      value: Object.assign({}, props || {}, {
        getContent: getContentGenerator(contentCache),
        globalContent: props.globalContent,
        requestUri: props.requestUri
      })
    },
    React.createElement(Template)
  )
  wrapper.contentCache = contentCache
  return wrapper
}
