'use strict'

/* global window, Fusion */

const React = require('react')

const isClient = typeof window !== 'undefined'
const identity = (data) => data

// these turn out to be slightly smaller than using 'lodash/get' and 'lodash/merge'
const _get = require('lodash.get')
const _merge = require('lodash.merge')

const PROP_PREFIX_FIELD = Symbol('prop-prefix')
const ELEMENT_FIELDS = [
  // 'children',
  'content_elements'
]

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
    content[PROP_PREFIX_FIELD] = contentLabel

    ELEMENT_FIELDS.forEach((elementField) => {
      if (content && content[elementField]) {
        content[elementField]
          .forEach((contentElement) => {
            contentElement[PROP_PREFIX_FIELD] = `${contentLabel}.${elementField}.${getId(contentElement)}`
          })
      }
    })
  }

  return content
}

function editContentElement (contentElement, editElements) {
  const elementId = getId(contentElement)
  return (elementId && editElements[elementId])
    ? _merge(
      {},
      contentElement,
      editElements[elementId]
    )
    : contentElement
}

function editContent (content, localEdits, name) {
  const appendLocalEdits = (content) => {
    const contentId = getId(content)
    const contentLabel = getContentLabel(content, name)

    if (!(localEdits && (localEdits[contentId] || localEdits[contentLabel]))) {
      return content
    }

    const contentEdits = Object.assign(
      {},
      localEdits && localEdits[contentId],
      localEdits && localEdits[contentLabel]
    )

    const contentEditElements = Object.assign(
      {},
      ...ELEMENT_FIELDS.map((elementField) => {
        const elementEdits = contentEdits[elementField]
        delete contentEdits[elementField]
        if (elementEdits) {
          return { [elementField]: elementEdits }
        }
      })
    )

    const contentElements = Object.assign(
      {},
      ...ELEMENT_FIELDS.map((elementField) => {
        const elements = content && content[elementField]
        if (elements) {
          return { [elementField]: editContentElement(elements, contentEditElements[elementField]) }
        }
      })
    )

    return _merge(
      {},
      content,
      contentEdits,
      contentElements
    )
  }

  return appendLocalEdits(labelContent(content, name))
}

function getContextProps (props, context) {
  return {
    props: {
      ...context.props,
      globalContent: editContent(context.props.globalContent, props.localEdits),
      ...props
    },
    children: props.children
  }
}

function createContextElement (Component, props, context) {
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
      'data-content-editable': `${element[PROP_PREFIX_FIELD]}.${contentProp}`,
      'contentEditable': 'true'
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
      // don't use a constructor here, since the extended class may try to use these APIs in its own super constructor
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

          if (inherit) {
            return {
              cached: this.props.globalContent,
              fetched: Promise.resolve(this.props.globalContent)
            }
          }

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

          const { cached, fetched } = context.getContent(sourceName, query, filter, ConsumerWrapper)

          const name = (isConfig && sourceOrConfig.name)
          const transform = (isConfig && sourceOrConfig.transform) || identity

          return {
            cached: editContent(transform(cached), props.localEdits, name),
            fetched: fetched
              .then(transform)
              .then((fetched) => editContent(fetched, props.localEdits, name))
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

Consumer.labelContent = labelContent

module.exports = Consumer
