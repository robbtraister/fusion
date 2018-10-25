'use strict'

const React = require('react')
const _merge = require('lodash.merge')

const isStatic = require('./utils/is-static')

const JSONNormalize = require('../../utils/normalize')
const { LOG_TYPES, ...logger } = require('../../utils/logger')

const getSource = require('../../models/sources')

const getContentGenerator = function getContentGenerator (contentCache, arcSite, outputType) {
  contentCache = contentCache || {}

  return function getContent (sourceName, ...args) {
    const sourceCache = contentCache[sourceName] = contentCache[sourceName] || {}
    const sourcePromise = getSource(sourceName)
      .catch((err) => {
        logger.logError({ message: 'An error occurred while attempting to get content.', stackTrace: err.stack })
        return null
      })

    const getSourceContent = (query, filter, component) => {
      // alphabetize object keys to ensure proper cacheing
      const queryString = JSONNormalize.stringify(query)
      const queryCache = sourceCache[queryString] = sourceCache[queryString] || {
        cached: undefined,
        filtered: undefined,
        fetched: sourcePromise
          .then(source => {
            queryCache.source = source
            return (source)
              ? source.fetch(Object.assign({}, query, { 'arc-site': arcSite }))
              : null
          })
          .then(data => { queryCache.cached = data })
          .catch((err) => {
            logger.logError({ logType: LOG_TYPES.FETCH_FROM_SOURCE, message: 'An error occurred while attempting to fetch.', stackTrace: err.stack })
            queryCache.cached = null
          })
          .then(() => queryCache.cached),
        source: undefined
      }

      queryCache.fetched = queryCache.fetched
        .then(data => queryCache.source ? queryCache.source.filter(filter, data) : queryCache.cached)
        .then(filtered => {
          if (!isStatic(component, outputType)) {
            queryCache.filtered = queryCache.cached ? _merge(queryCache.filtered, filtered) : null
          }
          return queryCache.cached
        })

      // Server-side, we never need to worry about the Promise or async content
      // we will re-render using the cached content if necessary
      return queryCache
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
