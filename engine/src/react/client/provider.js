'use strict'

/* global Fusion */

const React = require('react')

const contextTypes = require('../shared/context-types')

const JSONNormalize = require('../../utils/normalize')

class Provider extends React.Component {
  getChildContext () {
    const contentCache = this.props.contentCache || {}
    const fetchCache = {}

    const getContent = function getContent (source, ...args) {
      const fetchContent = (source, keyString, filter) =>
        window.fetch(`/${Fusion.context}/api/v3/content/${source}?key=${keyString}` + (filter ? `&filter=${filter.replace(/\s+/g, ' ').trim()}` : ''))
          .then(resp => resp.json())

      const getSourceContent = (key, filter) => {
        const keyString = JSONNormalize.stringify(key)
        const cached = contentCache[source][keyString] || undefined

        const sourceCache = fetchCache[source] = fetchCache[source] || {}
        const keyCache = sourceCache[keyString] = sourceCache[keyString] || {}
        const promise = keyCache[filter] = keyCache[filter] || (
          (Fusion.isFresh && cached)
            ? Promise.resolve(cached)
            : fetchContent(source, keyString, filter)
        )

        try {
          return {
            cached,
            promise
          }
        } catch (e) {
          return null
        }
      }

      return (args.length === 0)
        ? getSourceContent
        : getSourceContent.apply(this, args)
    }

    return {
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

module.exports = Provider
