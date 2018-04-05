'use strict'

/* global window, Fusion */

// const React = require('react')
//
// const contextTypes = require('./context-types')
//
// const isClient = typeof window !== 'undefined'
//
// const prepareProps = function prepareProps (props) {
//   return props
// }
//
// const prepareContext = function prepareContext (context) {
//   const preparedContext = Object.assign({}, context)
//   delete preparedContext.getContent
//   return preparedContext
// }
//
// const HOC = function HOC (Component) {
//   if (Component.prototype instanceof React.Component) {
//     // if Component is a React Component class, wrap it with new class with context access and `getContent` instance method
//     const HOConsumer = class HOConsumer extends Component {
//       getAsyncContent (...args) {
//         return Consumer.prototype.getAsyncContent.apply(this, args)
//       }
//       getContent (...args) {
//         return Consumer.prototype.getContent.apply(this, args)
//       }
//       setContent (contents) {
//         Consumer.prototype.setContent.call(this, contents)
//       }
//     }
//     HOConsumer.contextTypes = contextTypes
//     return HOConsumer
//   } else {
//     // if Component is a functional component, make context available
//     const HOConsumer = (props, context) => {
//       return Component(prepareProps(props), prepareContext(context))
//     }
//     HOConsumer.contextTypes = contextTypes
//     return HOConsumer
//   }
// }
//
// /*
//  * Consumer is an extension of the React.Component class that adds
//  * `globalContent` and `requestUri` fields to context, and `getContent` to the instance
//  *
//  * It is built using the function object pattern in order to support use as either
//  * a base class or a Higher-Order Component
//  *
//  * context.globalContent
//  *   represents the global content used to render the page
//  * context.requestUri
//  *   represents the originally requested URI to be rendered
//  * this.getContent(source, key, query)
//  *   is a store function to retrieve a specific piece of content and is only
//  *   provided for class components
//  *     `source` is the name of the content source
//  *     `key` is the identifier used to specify the piece of content
//  *     `query` is either the name of a component or a graphql query
//  */
// function Consumer (propsOrComponent, context) {
//   if (this instanceof Consumer) {
//     // if Consumer is used as a base-class, this function will be called as super constructor
//     if (!context) {
//       throw new Error('Context is required; did you remember to pass `props` _and_ `context` to `super`')
//     }
//     React.Component.call(this, propsOrComponent, context)
//   } else {
//     if (!propsOrComponent) {
//       throw new Error('Consumer requires a base component or to be used as an HOC')
//     }
//     return HOC(propsOrComponent)
//   }
// }
//
// // Configure Consumer as an extension of React.Component
// Consumer.prototype = Object.create(React.Component.prototype)
// Consumer.prototype.constructor = Consumer
// Consumer.parent = React.Component.prototype
//
// Consumer.prototype.getAsyncContent = function (...args) {
//   if (!this.context) {
//     throw new Error('Context is required; did you remember to pass both `props` _and_ `context` to `super`')
//   }
//   return this.context.getAsyncContent.apply(this, args)
// }
// Consumer.prototype.getContent = function (...args) {
//   if (!this.context) {
//     throw new Error('Context is required; did you remember to pass both `props` _and_ `context` to `super`')
//   }
//   return this.context.getContent.apply(this, args)
// }
//
// Consumer.prototype.setContent = function (contents) {
//   this.state = this.state || {}
//   Object.keys(contents).forEach(key => {
//     const content = contents[key]
//     if (isClient) {
//       if (Fusion.refreshContent || content.cached === undefined) {
//         // this case is only necessary on the client
//         // on the server, we will wait for the content to hydrate and manually re-render
//         content.promise.then(data => { this.setState({[key]: data}) })
//       }
//     }
//
//     // this case is only possible if content was fetched server-side
//     // content can only be fetched server-side if requested prior to mounting (.e.g, constructor or componentWillMount)
//     // prior to mounting, we should set state directly, not using the `setState` method
//     this.state[key] = content.cached
//   })
// }
//
// Consumer.contextTypes = contextTypes
//
// module.exports = Consumer

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
  } else {
    if (!propsOrComponent) {
      throw new Error('Consumer requires a base component or to be used as an HOC')
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
