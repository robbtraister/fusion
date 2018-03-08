'use strict'

const _ = require('lodash')
const JSONNormalize = require('json-normalize')

const React = require('react')
const E = React.createElement

const contextTypes = require('./types')

const getSource = require('../../sources')

class Provider extends React.Component {
  getChildContext () {
    const cacheMap = this.props.cacheMap || {}

    return {
      getContent (sourceName, ...args) {
        const sourceCache = cacheMap[sourceName] = cacheMap[sourceName] || {}
        const source = getSource(sourceName)

        const getSourceContent = (key, query) => {
          // alphabetize object keys to ensure proper cacheability
          const keyString = JSONNormalize.stringifySync(key)
          const keyCache = sourceCache[keyString] = sourceCache[keyString] || {
            data: undefined,
            filtered: undefined,
            promise: source.fetch(key)
              .then(data => {
                keyCache.data = data
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
            })
            .then(() => keyCache.data)

          return keyCache.data
        }

        return (args.length === 0)
          ? getSourceContent
          : getSourceContent(...args)
      },
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
        this.props.children
        // E('script', {dangerouslySetInnerHTML: { __html: `var contentCache=${JSON.stringify(condensedMap, (key, value) => value == null ? undefined : value)}` }})
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
