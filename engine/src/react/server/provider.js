'use strict'

const _ = require('lodash')
const JSONNormalize = require('../../utils/normalize')

const React = require('react')
const E = React.createElement

const contextTypes = require('../shared/context-types')

const getSource = require('../../content/sources')

class Provider extends React.Component {
  getChildContext () {
    const cacheMap = this.props.cacheMap || {}

    const getContent = function getContent (sourceName, ...args) {
      const sourceCache = cacheMap[sourceName] = cacheMap[sourceName] || {}
      const source = getSource(sourceName)

      const getSourceContent = (key, query) => {
        // alphabetize object keys to ensure proper cacheing
        const keyString = JSONNormalize.stringify(key)
        const keyCache = sourceCache[keyString] = sourceCache[keyString] || {
          cached: undefined,
          filtered: undefined,
          promise: source.fetch(key)
            .then(data => {
              keyCache.cached = data
              return data
            })
        }

        keyCache.promise = keyCache.promise
          .then(data => (query && source && source.schemaName)
            ? source.filter(query, data)
            : data
          )
          .then(filtered => {
            keyCache.filtered = _.merge(keyCache.filtered, filtered)
            return keyCache.cached
          })

        // Server-side, we never need to worry about the Promise or async content
        // we will re-render using the cached content if necessary
        return keyCache // || keyCache.promise
      }

      return (args.length === 0)
        ? getSourceContent
        : getSourceContent(...args)
    }

    return {
      // getAsyncContent: () => ({cached: undefined, promise: null}),
      getContent,
      globalContent: this.props.globalContent,
      requestUri: this.props.requestUri
    }
  }

  render () {
    const cacheMap = this.props.cacheMap

    if (cacheMap && Object.keys(cacheMap).length > 0) {
      const condensedMap = {}
      Object.keys(cacheMap)
        .forEach(sourceName => {
          condensedMap[sourceName] = {}
          Object.keys(cacheMap[sourceName])
            .forEach(key => {
              condensedMap[sourceName][key] = cacheMap[sourceName][key].filtered
            })
        })

      return E(React.Fragment, {},
        this.props.children,
        // set `isFresh` property so the client knows if content needs to be refreshed
        E('script', {dangerouslySetInnerHTML: { __html: `window.Fusion=window.Fusion||{};Fusion.context='${(process.env.CONTEXT || 'pb').replace(/^\/*/, '/')}';Fusion.isFresh=${process.env.ON_DEMAND === 'true' ? 'true' : 'false'};Fusion.cache=${JSON.stringify(condensedMap, (key, value) => value == null ? undefined : value)}` }})
      )
    } else {
      return this.props.children
    }
  }
}

Provider.childContextTypes = contextTypes

module.exports = Template => {
  const cacheMap = {}
  const wrapper = props => E(Provider, Object.assign({}, props, {cacheMap}), E(Template))
  wrapper.cacheMap = cacheMap
  return wrapper
}
