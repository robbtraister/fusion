'use strict'

const _ = require('lodash')
const React = require('react')

const isStatic = require('./is-static')

const JSONNormalize = require('../../utils/normalize')

const getSource = require('../../models/sources')

const getContentGenerator = function getContentGenerator (contentCache, arcSite, outputType) {
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
            return source.fetch(Object.assign({}, key, {'arc-site': arcSite}))
          })
          .then(data => { keyCache.cached = data })
          .catch(() => {
            keyCache.cached = null
          })
          .then(() => keyCache.cached),
        source: undefined
      }

      keyCache.fetched = keyCache.fetched
        .then(data => keyCache.source.filter(query, data))
        .then(filtered => {
          if (!isStatic(this, outputType)) {
            keyCache.filtered = keyCache.cached ? _.merge(keyCache.filtered, filtered) : null
          }
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
  const wrapper = (props) => {
    props = props || {}
    return React.createElement(
      FusionContext.Provider,
      {
        value: Object.assign({}, props, {
          arcSite: props.arcSite,
          contextPath: props.contextPath,
          eventListeners: {},
          getContent: getContentGenerator(contentCache, props.arcSite, props.outputType),
          globalContent: props.globalContent,
          outputType: props.outputType,
          requestUri: props.requestUri
        })
      },
      React.createElement(Template)
    )
  }
  wrapper.contentCache = contentCache
  wrapper.inlines = {}
  return wrapper
}
