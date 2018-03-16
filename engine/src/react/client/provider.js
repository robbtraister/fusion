'use strict'

const React = require('react')

const contextTypes = require('../shared/context-types')

const JSONNormalize = require('../../utils/normalize')

class Provider extends React.Component {
  getChildContext () {
    const contentCache = this.props.contentCache || {}
    const fetchCache = {}

    return {
      getContent (source, ...args) {
        const fetchContent = (source, keyString, filter) =>
          window.fetch(`/content/${source}?key=${keyString}` + (filter ? `&filter=${filter.replace(/\s+/g, ' ').trim()}` : ''))
            .then(resp => resp.json())

        const getContent = (key, filter) => {
          const keyString = JSONNormalize.stringify(key)
          const sourceCache = fetchCache[source] = fetchCache[source] || {}
          const keyCache = sourceCache[keyString] = sourceCache[keyString] || {}
          const content = keyCache[filter] = keyCache[filter] || fetchContent(source, keyString, filter)
          if (this && this.setState) {
            content.then(json => this.setState(json))
          }

          try {
            return contentCache[source][keyString] || null
          } catch (e) {
            return null
          }
        }

        return (args.length === 0)
          ? getContent
          : getContent.apply(this, args)
      },
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
