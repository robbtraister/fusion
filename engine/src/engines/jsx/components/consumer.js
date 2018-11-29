'use strict'

/* global Fusion */

const React = require('react')

// these turn out to be slightly smaller than using 'lodash/get' and 'lodash/merge'
const _merge = require('lodash.merge')

const JSONNormalize = require('../utils/normalize')

const PROP_PREFIX_FIELD = Symbol('prop-prefix')
const ELEMENT_FIELDS = [
  // 'children',
  'content_elements'
]

const isClient = typeof window !== 'undefined'

const identity = (data) => data

const isFunction = (Component) => (Component instanceof Function)
const isReactComponent = (Component) => (Component && Component.prototype instanceof React.Component)
const getComponentName = (Component) => Component.displayName || Component.name || 'Component'

function normalize (query) {
  try {
    return JSON.parse(JSONNormalize.stringify(query))
  } catch (_) {
    return query
  }
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

    return Object.assign(
      {},
      content,
      ...ELEMENT_FIELDS.map((elementField) => {
        if (content && content[elementField]) {
          return {
            [elementField]: content[elementField]
              .map((contentElement) => {
                return Object.assign(
                  {},
                  contentElement,
                  { [PROP_PREFIX_FIELD]: `${contentLabel}.${elementField}.${getId(contentElement)}` }
                )
              })
          }
        }
      }),
      { [PROP_PREFIX_FIELD]: contentLabel }
    )
  }

  return content
}

function mergeEdits (base, ...edits) {
  const existingEdits = edits.filter((edit) => !!edit)

  return (existingEdits.length)
    ? Object.assign(
      _merge(
        {},
        base,
        ...existingEdits
      ),
      // _merge does not preserve Symbol props
      { [PROP_PREFIX_FIELD]: base[PROP_PREFIX_FIELD] }
    )
    : base
}

function editContentElement (contentElement, editElements) {
  const elementId = getId(contentElement)
  return mergeEdits(contentElement, editElements && editElements[elementId])
}

function applyLocalEdits (content, localEdits, name) {
  const labeledContent = labelContent(content)

  const contentId = getId(labeledContent)
  const contentLabel = getContentLabel(labeledContent, name)

  if (!(localEdits && (localEdits[contentId] || localEdits[contentLabel]))) {
    return labeledContent
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
      const elements = labeledContent && labeledContent[elementField]
      if (elements && contentEditElements[elementField]) {
        return { [elementField]: elements.map(element => editContentElement(element, contentEditElements[elementField])) }
      }
    })
  )

  return mergeEdits(content, contentEdits, contentElements)
}

function getEditablePropName (prop, prefix) {
  return `${prefix ? `${prefix}.` : ''}${prop}`
}

function getEditablePropAttribute (prop, prefix) {
  if (prop instanceof Object) {
    return Object.keys(prop)
      .map((label) => `${label}=${getEditablePropName(prop[label], prefix)}`)
      .join(';')
  } else {
    return getEditablePropName(prop, prefix)
  }
}

function getEditableFns (props) {
  return {
    editableField: (isClient && Fusion.isAdmin)
      ? (fieldProp) => ({
        'data-feature': props.id,
        'data-field-editable': getEditablePropAttribute(fieldProp),
        'contentEditable': 'true'
      })
      : () => ({}),

    editableContent: (isClient && Fusion.isAdmin)
      ? (element, contentProp) => ({
        'data-feature': props.id,
        'data-content-editable': getEditablePropAttribute(contentProp, element && element[PROP_PREFIX_FIELD]),
        'contentEditable': 'true'
      })
      : () => ({})
  }
}

function getMutation (transform, localEdits, name) {
  transform = transform || identity

  return function (content, prevState, props) {
    return applyLocalEdits(
      transform(content, prevState, props),
      localEdits,
      name
    )
  }
}

function ExtendClassComponent (Component, { eventListeners, getContent, props: contextProps }) {
  class ConsumerExtension extends Component {
    addEventListener (eventType, eventHandler) {
      const listeners = eventListeners[eventType] = eventListeners[eventType] || []
      listeners.push(eventHandler)
    }

    dispatchEvent (eventType, data) {
      const listeners = eventListeners[eventType] || []
      listeners.forEach((listener) => {
        try {
          listener(data)
        } catch (_) {}
      })
    }

    removeEventListener (eventType, eventHandler) {
      const listeners = eventListeners[eventType] || null
      if (listeners) {
        eventListeners[eventType] = listeners.filter((listener) => listener !== eventHandler)
      }
    }

    getContent (sourceOrConfig/* , query, filter, inherit */, skipMutations) {
      if (!(sourceOrConfig instanceof Object)) {
        return this.getContent({
          source: arguments[0],
          query: arguments[1],
          filter: arguments[2],
          inherit: arguments[3]
        })
      }

      const { name, source, query, key, filter, inherit } = sourceOrConfig

      if (inherit) {
        return {
          cached: contextProps.globalContent,
          fetched: Promise.resolve(contextProps.globalContent)
        }
      }

      if (!source) {
        return {
          fetched: Promise.resolve()
        }
      }

      const { cached, fetched } = getContent({
        source,
        filter,
        inherit,
        query: normalize(query || key)
      })

      const mutate = (skipMutations)
        ? identity
        : getMutation(sourceOrConfig.transform, this.props.localEdits, name)

      return {
        cached: mutate(cached),
        fetched: fetched
          .then(mutate)
      }
    }

    fetchContent (configMap) {
      this.state = this.state || {}

      Object.assign(
        this.state,
        ...Object.keys(configMap)
          .map((name) => {
            const contentConfig = configMap[name]
            const mutate = getMutation(contentConfig.transform, this.props.localEdits, name)

            const { cached, fetched } = this.getContent(contentConfig, true)
            fetched.then((data) => {
              this.setState((prevState, props) => ({ [name]: mutate(data, prevState, props) }))
            })
            return { [name]: mutate(cached) }
          })
      )
    }
  }

  for (let key in Component) {
    ConsumerExtension[key] = Component[key]
  }
  ConsumerExtension.displayName = getComponentName(Component)

  return ConsumerExtension
}

function ConsumerComponent (Component, context) {
  return (isReactComponent(Component))
    ? ExtendClassComponent(Component, context)
    : Component
}

function Consumer (Component) {
  if (this instanceof Consumer) {
    // if Consumer is used as a base-class, this function will be called as super constructor
    throw new Error('Consumer may not be used as a base class')
  }

  if (!isFunction(Component) && !isReactComponent(Component)) {
    throw new Error('Consumer must be used as an HOC')
  }

  const WrappedComponent = (props) =>
    React.createElement(
      // do not denote as global. or window.; could be either
      Fusion.context.Consumer,
      {},
      (context) =>
        React.createElement(
          ConsumerComponent(Component, context),
          {
            ...context.props,
            globalContent: applyLocalEdits(context.props.globalContent, props.localEdits),
            ...getEditableFns(props),
            ...props
          }
        )
    )

  WrappedComponent.displayName = `FusionConsumer(${getComponentName(Component)})`

  return WrappedComponent
}

module.exports = Consumer
