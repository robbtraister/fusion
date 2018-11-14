'use strict'

/* global window, Fusion */

const React = require('react')

const isClient = typeof window !== 'undefined'
const identity = (data) => data

// these turn out to be slightly smaller than using 'lodash/get' and 'lodash/merge'
const _get = require('lodash.get')
const _merge = require('lodash.merge')

const CONTENT_LABEL_FIELD = Symbol('content-label')
const ELEMENT_ID_FIELD = Symbol('element-id')

const getContextProps = (props, context) => {
  return {
    props: { ...context.props, ...props },
    children: props.children
  }
}

const createContextElement = (Component, props, context) => {
  const { props: contextProps, children } = getContextProps(props, context)

  contextProps.editableField = (isClient && Fusion.isAdmin)
    ? (fieldProp) => ({
      'data-feature': props.id,
      'data-field-editable': fieldProp,
      'contentEditable': 'true'
    })
    : () => ({})

  contextProps.editableContent = (isClient && Fusion.isAdmin)
    ? (contentProp, element) => ({
      'data-feature': props.id,
      'data-content-name': element[CONTENT_LABEL_FIELD],
      'data-content-editable': (element[ELEMENT_ID_FIELD])
        ? `content_elements.${element[ELEMENT_ID_FIELD]}.${contentProp}`
        : contentProp,
      'contentEditable': 'true'
    })
    : () => ({})

  return React.createElement(
    Component,
    contextProps,
    children
  )
}

function getId (content) {
  return (content) ? (content.id || content._id) : null
}

function getContentLabel (content, name) {
  const contentId = getId(content)
  return (contentId)
    ? ((name) ? `${name}:${contentId}` : contentId)
    : null
}

function labelContent (content, name) {
  if (content) {
    const contentLabel = getContentLabel(content, name)
    content[CONTENT_LABEL_FIELD] = contentLabel

    if (content && content.content_elements) {
      content.content_elements
        .forEach((contentElement) => {
          contentElement[CONTENT_LABEL_FIELD] = contentLabel
          contentElement[ELEMENT_ID_FIELD] = getId(contentElement)
        })
    }
  }

  return content
}

function transformContent ({ cached, fetched }, transform) {
  transform = (transform || identity)

  return {
    cached: transform(cached),
    fetched: fetched
      .then(transform)
  }
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
            } catch (e) {}
          })
        }

        removeEventListener (eventType, eventHandler) {
          const listeners = context.eventListeners[eventType] || null
          if (listeners) {
            context.eventListeners[eventType] = listeners.filter((listener) => listener !== eventHandler)
          }
        }

        editContent ({ cached, fetched }, name) {
          const appendLocalEdits = (content) => {
            const localEdits = Object.assign(
              {},
              props.localEdits && props.localEdits[getId(content)],
              props.localEdits && props.localEdits[getContentLabel(content, name)]
            )
            const localEditElements = localEdits.content_elements || {}
            delete localEdits.content_elements

            const appendLocalEditElement = (contentElement) => {
              const id = getId(contentElement)
              return (id && localEditElements[id])
                ? _merge(
                  {},
                  contentElement,
                  localEditElements[id]
                )
                : contentElement
            }

            const contentElements = (content && content.content_elements)
              ? {
                content_elements: content.content_elements
                  .map(appendLocalEditElement)
              }
              : {}

            return _merge(
              {},
              content,
              localEdits,
              contentElements
            )
          }

          return {
            cached: appendLocalEdits(labelContent(cached, name)),
            fetched: fetched
              .then(content => labelContent(content, name))
              .then(appendLocalEdits)
          }
        }

        fetchContent (contents) {
          this.setContent(
            Object.assign(
              ...Object.keys(contents)
                .map(stateKey => ({
                  [stateKey]: this.getContent({
                    name: stateKey,
                    ...contents[stateKey]
                  })
                }))
            )
          )
        }

        getContent (sourceOrConfig, query, filter, inherit) {
          const isConfig = (sourceOrConfig instanceof Object)

          inherit = (isConfig)
            ? sourceOrConfig.inherit
            : inherit

          const content = (inherit)
            ? {
              cached: this.props.globalContent,
              fetched: Promise.resolve(this.props.globalContent)
            }
            : (() => {
              const sourceName = (isConfig)
                ? sourceOrConfig.contentService || sourceOrConfig.sourceName || sourceOrConfig.source
                : sourceOrConfig

              if (!sourceName) {
                return {
                  cached: null,
                  fetched: Promise.resolve(null)
                }
              }

              if (isConfig && sourceOrConfig.hasOwnProperty('key')) {
                console.warn('--- WARNING: The \'key\' property on content configs has been renamed as \'query\'. Use of \'key\' has been DEPRECATED. ---')
                if (isConfig && sourceOrConfig.hasOwnProperty('query')) {
                  console.warn('--- WARNING: The \'query\' property on content configs has been renamed as \'filter\'. ---')
                }
                query = sourceOrConfig.key

                query = JSON.parse(JSON.stringify(query).replace(/\{\{([^}]+)\}\}/g, (match, propName) => {
                  return _get(this.props, propName) || match
                }))

                filter = sourceOrConfig.filter || sourceOrConfig.query
              } else {
                if (isConfig && sourceOrConfig.hasOwnProperty('contentConfigValues') && sourceOrConfig.hasOwnProperty('query') && !sourceOrConfig.hasOwnProperty('filter')) {
                  console.warn('--- WARNING: The \'query\' property on content configs has been renamed as \'filter\'. ---')
                  sourceOrConfig.filter = sourceOrConfig.query
                }

                query = (isConfig)
                  ? sourceOrConfig.contentConfigValues || sourceOrConfig.query
                  : query

                query = JSON.parse(JSON.stringify(query).replace(/\{\{([^}]+)\}\}/g, (match, propName) => {
                  return _get(this.props, propName) || match
                }))

                filter = (isConfig)
                  ? sourceOrConfig.filter
                  : filter
              }

              return context.getContent(sourceName, query, filter, ConsumerWrapper)
            })()

          const name = (isConfig && sourceOrConfig.name)
          const transform = (isConfig && sourceOrConfig.transform)

          return this.editContent(
            transformContent(content, transform),
            name
          )
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
