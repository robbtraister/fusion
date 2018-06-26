'use strict'

/* global window, Fusion */

const React = require('react')

const isClient = typeof window !== 'undefined'

function assign (target, keys, value) {
  const k = keys.shift()
  if (keys.length > 0) {
    target[k] = target[k] || {}
    assign(target[k], keys, value)
  } else {
    target[k] = value
  }
  return target
}

function merge (base, ...args) {
  const result = Object.assign({}, base)
  args
    .filter((edits) => edits)
    .forEach((edits) => {
      Object.keys(edits).forEach((key) => {
        assign(result, key.split(/[.．]/g), edits[key])
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
            Object.assign({},
              ...Object.keys(contents)
                .map(stateKey => {
                  const content = contents[stateKey]
                  const contentSource = content.source || content.contentService
                  const contentKey = content.key || content.contentConfigValues
                  return contentSource ? {[stateKey]: this.getContent(contentSource, contentKey, content.query)} : {}
                })
            )
          )
        }

        getContent (...args) {
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

          const content = context.getContent(...args)

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
            // content can only be fetched server-side if requested prior to mounting (.e.g, constructor or componentWillMount)
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
