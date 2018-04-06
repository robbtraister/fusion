'use strict'

/* global window, Fusion */

const React = require('react')

const isClient = typeof window !== 'undefined'

function HOC (Component) {
  const createElement = (Comp, props, context) => {
    const combinedProps = Object.assign({}, props, context)
    delete combinedProps.getContent
    return React.createElement(
      Comp,
      combinedProps
    )
  }

  const elementGenerator = (Component.prototype instanceof React.Component)
    // if Component is a React Component class, wrap it with new class with context access and `getContent` instance method
    ? (props) => (context) => {
      class ComponentConsumer extends Component {
        getContent (...args) {
          return context.getContent(...args)
        }
        setContent (...args) {
          Consumer.prototype.setContent.call(this, ...args)
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

// Configure Consumer as an extension of React.Component
Consumer.prototype = Object.create(React.Component.prototype)
Consumer.prototype.constructor = Consumer
Consumer.parent = React.Component.prototype

// TODO: this does not work; don't use it
Consumer.prototype.getContent = function () {
  return {
    cached: null,
    fetched: Promise.resolve()
  }
}

Consumer.prototype.setContent = function (contents) {
  this.state = this.state || {}
  Object.keys(contents).forEach(key => {
    const content = contents[key]
    if (isClient) {
      if (Fusion.refreshContent || content.cached === undefined) {
        // this case is only necessary on the client
        // on the server, we will wait for the content to hydrate and manually re-render
        content.fetched.then(data => { this.setState({[key]: data}) })
      }
    }

    // this case is only possible if content was fetched server-side
    // content can only be fetched server-side if requested prior to mounting (.e.g, constructor or componentWillMount)
    // prior to mounting, we should set state directly, not using the `setState` method
    this.state[key] = content.cached
  })
}

module.exports = Consumer
