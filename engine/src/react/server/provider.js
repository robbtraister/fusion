'use strict'

const _ = require('lodash')
const JSONNormalize = require('../../utils/normalize')

const React = require('react')

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
            .then(data => { keyCache.cached = data })
            .catch(() => { keyCache.cached = null })
            .then(() => keyCache.cached)
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
    return this.props.children
  }
}

Provider.childContextTypes = contextTypes

module.exports = Template => {
  const cacheMap = {}
  const wrapper = props => React.createElement(Provider, Object.assign({}, props, {cacheMap}), React.createElement(Template))
  wrapper.cacheMap = cacheMap
  return wrapper
}
