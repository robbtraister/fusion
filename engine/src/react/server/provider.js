'use strict'

const React = require('react')
const _merge = require('lodash.merge')

const isStatic = require('./utils/is-static')

const JSONNormalize = require('../../utils/normalize')
const { logError, LOG_TYPES } = require('../../utils/logger')

const getSource = require('../../models/sources')

const getContentGenerator = function getContentGenerator (contentCache, arcSite, outputType) {
  contentCache = contentCache || {}

  return function getContent (sourceName, ...args) {
    const sourceCache = contentCache[sourceName] = contentCache[sourceName] || {}
    const sourcePromise = getSource(sourceName)
      .catch((err) => {
        logError({message: `${err.stack || err}`})
        return null
      })

    const getSourceContent = (key, query) => {
      // alphabetize object keys to ensure proper cacheing
      const keyString = JSONNormalize.stringify(key)
      const keyCache = sourceCache[keyString] = sourceCache[keyString] || {
        cached: undefined,
        filtered: undefined,
        fetched: sourcePromise
          .then(source => {
            keyCache.source = source
            return (source)
              ? source.fetch(Object.assign({}, key, { 'arc-site': arcSite }))
              : null
          })
          .then(data => { keyCache.cached = data })
          .catch((err) => {
            logError({logType: LOG_TYPES.FETCH_FROM_SOURCE, message: `An error occurred while attempting to fetch: ${err.stack || err}`})
            keyCache.cached = null
          })
          .then(() => keyCache.cached),
        source: undefined
      }

      keyCache.fetched = keyCache.fetched
        .then(data => keyCache.source ? keyCache.source.filter(query, data) : keyCache.cached)
        .then(filtered => {
          if (!isStatic(this, outputType)) {
            keyCache.filtered = keyCache.cached ? _merge(keyCache.filtered, filtered) : null
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

module.exports = (Template, inlines, contentCache) => {
  const providerContentCache = contentCache || {}
  const wrapper = (props) => {
    props = props || {}
    return React.createElement(
      FusionContext.Provider,
      {
        value: Object.assign(
          {
            // arcSite: props.arcSite,
            // contextPath: props.contextPath,
            eventListeners: {},
            getContent: getContentGenerator(providerContentCache, props.arcSite, props.outputType),
            props: {
              // globalContent: props.globalContent,
              // globalContentConfig: props.globalContentConfig,
              layout: Template.layout,
              // outputType: props.outputType,
              // requestUri: props.requestUri,
              // siteProperties: props.siteProperties,
              template: Template.id,
              ...props
            }
          }
        )
      },
      React.createElement(Template)
    )
  }
  Object.assign(wrapper, Template)
  wrapper.contentCache = providerContentCache
  wrapper.inlines = inlines || {}
  return wrapper
}
