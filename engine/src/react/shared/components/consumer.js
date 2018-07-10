'use strict'

/* global window, Fusion */

const React = require('react')

const isClient = typeof window !== 'undefined'

const splitIndexes = (key) => {
  // pull off the last numbered index
  const indexed = key.match(/^(.*)\[(\d+)\]$/)
  return (indexed)
    ? splitIndexes(indexed[1]).concat(indexed[2])
    : [key]
}
const splitKey = (key) => {
  const keys = key.split(/[.．]/g)
  return [].concat(...keys.map(splitIndexes))
}

const setProperty = (() => {
  function _setProperty (target, keys, value) {
    const k = keys.shift()
    if (keys.length > 0) {
      target[k] = target[k] || {}
      _setProperty(target[k], keys, value)
    } else {
      target[k] = value
    }
    return target
  }
  return function setProperty (target, key, value) {
    return _setProperty(target, (key instanceof Array) ? key : splitKey(key), value)
  }
})()

const getProperty = (() => {
  function _getProperty (target, keys) {
    const k = keys.shift()
    try {
      target = target[k]
    } catch (e) {
      return undefined
    }
    return (keys.length > 0)
      ? _getProperty(target, keys)
      : target
  }
  return function getProperty (target, key) {
    return _getProperty(target, (key instanceof Array) ? key : splitKey(key))
  }
})()

function merge (base, ...args) {
  const result = Object.assign({}, base)
  args
    .filter((edits) => edits)
    .forEach((edits) => {
      Object.keys(edits).forEach((key) => {
        setProperty(result, key, edits[key])
      })
    })
  return result
}

function HOC (Component) {
  const createElement = (Comp, props, context) => {
    const combinedProps = Object.assign({}, props, context)
    delete combinedProps.getContent
    delete combinedProps.setContent

    return React.createElement(
      Comp,
      combinedProps
    )
  }

  const elementGenerator = (Component.prototype instanceof React.Component)
    // if Component is a React Component class, wrap it with new class with context access and `getContent` instance method
    ? (props) => (context) => {
      class ComponentConsumer extends Component {
        fetchContent (contents) {
          this.setContent(
            Object.assign(
              ...Object.keys(contents)
                .map(stateKey => ({[stateKey]: this.getContent(contents[stateKey])}))
            )
          )
        }

        getContent (sourceOrConfig, key, filter, inherit) {
          const isConfig = (sourceOrConfig instanceof Object)

          inherit = (isConfig)
            ? sourceOrConfig.inherit
            : inherit

          if (inherit) {
            return {
              cached: this.props.globalContent,
              fetched: Promise.resolve(this.props.globalContent)
            }
          }

          const sourceName = (isConfig)
            ? sourceOrConfig.sourceName || sourceOrConfig.source || sourceOrConfig.contentService
            : sourceOrConfig

          if (!sourceName) {
            return {
              cached: null,
              fetched: Promise.resolve(null)
            }
          }

          key = (isConfig)
            ? sourceOrConfig.key || sourceOrConfig.contentConfigValues
            : key

          key = JSON.parse(JSON.stringify(key).replace(/\{\{([^}]+)\}\}/g, (match, propName) => {
            return getProperty(this.props, propName) || match
          }))

          filter = (isConfig)
            ? sourceOrConfig.filter || sourceOrConfig.query
            : filter

          const localEdits = Object.assign({}, this.props.localEdits || {})
          const localEditItems = localEdits.items || {}
          delete localEdits.items

          const appendLocalEdits = (content) => {
            return merge(
              content,
              localEdits,
              localEditItems[(content && (content.id || content._id)) || null]
            )
          }

          const content = context.getContent.call(this, sourceName, key, filter)

          return {
            cached: content.cached && appendLocalEdits(content.cached),
            fetched: content.fetched
              .then(appendLocalEdits)
          }
        }

        setContent (contents) {
          this.state = this.state || {}
          Object.keys(contents).forEach(key => {
            const content = contents[key]
            if (isClient) {
              // this case is only necessary on the client
              // on the server, we will wait for the content to hydrate and manually re-render
              content.fetched.then(data => { this.setState({[key]: data}) })
            }

            // this case is only possible if content was fetched server-side
            // content can only be fetched server-side if requested prior to mounting (e.g., constructor or componentWillMount)
            // prior to mounting, we should set state directly, not using the `setState` method
            this.state[key] = content.cached
          })
        }
      }

      return createElement(ComponentConsumer, props, context)
    }
    : (props) => (context) => createElement(Component, props, context)

  return (props) => React.createElement(
    Fusion.context.Consumer,
    {},
    elementGenerator(props)
  )
}

function Consumer (propsOrComponent) {
  if (this instanceof Consumer) {
    // if Consumer is used as a base-class, this function will be called as super constructor
    throw new Error('Consumer may not be used as a base class')
  } else {
    if (!propsOrComponent) {
      throw new Error('Consumer must be used as an HOC')
    }
    return HOC(propsOrComponent)
  }
}

module.exports = Consumer
