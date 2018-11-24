'use strict'

const React = require('react')

const Message = require('../components/message')

const BaseLoader = require('../../_shared/loaders/base-loader')

function getDefaultComponent ({ collection }) {
  return (collection === 'features')
    ? null
    : (collection === 'sections')
      ? 'section'
      : 'div'
}

class JsxLoader extends BaseLoader {
  createElement (node) {
    const loadComponent = () => {
      try {
        return this.loadComponent(node)
      } catch (err) {}
    }
    const Component = loadComponent(node) || getDefaultComponent(node)

    return (Component)
      ? React.createElement(
        Component,
        {
          key: node.props.id,
          ...node.props
        },
        this.createChildren(node)
      )
      : this.getErrorElement(
        {
          ...node,
          message: 'Could not load component'
        }
      )
  }

  getErrorElement (node) {
    const { collection, type, props, message } = node
    return React.createElement(
      Message,
      {
        key: props.id,
        collection,
        type,
        id: props.id,
        name: props.name,
        message: `${message} [${collection}:${type}]`
      }
    )
  }
}

module.exports = JsxLoader
