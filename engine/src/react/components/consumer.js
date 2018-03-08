'use strict'

const React = require('react')

const contextTypes = require('./types')

const prepareProps = function prepareProps (props) {
  return props
}

const prepareContext = function prepareContext (context) {
  const preparedContext = Object.assign({}, context)
  delete preparedContext.getContent
  return preparedContext
}

const HOC = function HOC (Component) {
  const Consumer = (props, context) => Component(prepareProps(props), prepareContext(context))
  Consumer.contextTypes = contextTypes
  return Consumer
}

/*
 * Consumer is an extension of the React.Component class that adds
 * `globalContent` and `requestUri` fields to context, and `getContent` to the instance
 *
 * It is built using the function pattern in order to support use as either
 * a base class or a Higher-Order Component
 *
 * context.globalContent
 *   represents the global content used to render the page
 * context.requestUri
 *   represents the originally requested URI to be rendered
 * this.getContent(source, key, filter)
 *   is a store function to retrieve a specific piece of content and is only
 *   provided for class components
 *     `source` is the name of the content source
 *     `key` is the identifier used to specify the piece of content
 *     `filter` is either the name of a component or a graphql query
 */
function Consumer (propsOrComponent, context) {
  if (this instanceof Consumer) {
    if (!context) {
      throw new Error('Context is required; did you remember to pass `props` _and_ `context` to `super`')
    }
    const getContent = context && context.getContent
    React.Component.call(this, prepareProps(propsOrComponent), prepareContext(context))
    this.getContent = getContent && getContent.bind(this)
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

Consumer.contextTypes = contextTypes

module.exports = Consumer
