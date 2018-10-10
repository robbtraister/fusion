'use strict'

/* global window, Fusion */

const React = require('react')

const isClient = typeof window !== 'undefined'

// these turn out to be slightly smaller than using 'lodash/get' and 'lodash/merge'
const _get = require('lodash.get')
const _merge = require('lodash.merge')

const { LOG_TYPES, ...logger } = require('../../../utils/logger')

const getContextProps = (props, context) => {
  return {
    props: { ...context.props, ...props },
    children: props.children
  }
}

const createContextElement = (Component, props, context) => {
  const { props: contextProps, children } = getContextProps(props, context)

  contextProps.contentEditable = (isClient && Fusion.isAdmin)
    ? (prop) => ({
      'data-content-editable': prop,
      'data-feature': props.id,
      'contenteditable': 'true'
    })
    : () => ({})

  return React.createElement(
    Component,
    contextProps,
    children
  )
}

function HOC (Component) {
  const elementGenerator = (Component.prototype instanceof React.Component)
    // if Component is a React Component class, wrap it with new class with context access and `getContent` instance method
    ? (props) => (context) => {
      class ComponentConsumer extends Component {
        addEventListener (eventType, eventHandler) {
          const listeners = context.eventListeners[eventType] = context.eventListeners[eventType] || []
          listeners.push(eventHandler)
        }

        dispatchEvent (eventType, data) {
          const listeners = context.eventListeners[eventType] || []
          listeners.forEach((listener) => {
            try {
              listener(data)
            } catch (e) {
              logger.logError({ logType: LOG_TYPES.COMPONENT, message: `An error occurred while dispatching an event: ${e.stack || e}` })
            }
          })
        }

        removeEventListener (eventType, eventHandler) {
          const listeners = context.eventListeners[eventType] || null
          if (listeners) {
            context.eventListeners[eventType] = listeners.filter((listener) => listener !== eventHandler)
          }
        }

        fetchContent (contents) {
          this.setContent(
            Object.assign(
              ...Object.keys(contents)
                .map(stateKey => ({ [stateKey]: this.getContent(contents[stateKey]) }))
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
            return _get(this.props, propName) || match
          }))

          filter = (isConfig)
            ? sourceOrConfig.filter || sourceOrConfig.query
            : filter

          const localEdits = Object.assign({}, this.props.localEdits || {})
          const localEditItems = localEdits.items || {}
          delete localEdits.items

          const appendLocalEdits = (content) => {
            return _merge(
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
              content.fetched.then(data => { this.setState({ [key]: data }) })
            }

            // this case is only possible if content was fetched server-side
            // content can only be fetched server-side if requested prior to mounting (e.g., constructor or componentWillMount)
            // prior to mounting, we should set state directly, not using the `setState` method
            this.state[key] = content.cached
          })
        }
      }

      ComponentConsumer.displayName = Component.displayName || Component.name

      return createContextElement(ComponentConsumer, props, context)
    }
    : (props) => (context) => createContextElement(Component, props, context)

  const ConsumerWrapper = (props) => React.createElement(
    Fusion.context.Consumer,
    {},
    elementGenerator(props)
  )

  for (let key in Component) {
    ConsumerWrapper[key] = Component[key]
  }
  ConsumerWrapper.displayName = `FusionConsumerWrapper(${Component.displayName || Component.name || 'Component'})`

  return ConsumerWrapper
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
