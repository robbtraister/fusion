'use strict'

const PropTypes = require('prop-types')
const React = require('react')

const Layout = require('./layout')
const Quarantine = require('./quarantine')

const { ComponentContext } = require('./contexts')

const Tree = props => {
  const { getComponent, tree } = props

  const componentCache = {}
  function getComponentFromCache (node) {
    const { collection, type } = node
    if (collection) {
      const collectionCache = (componentCache[collection] =
        componentCache[collection] || {})
      if (!Object.hasOwnProperty.call(collectionCache, type)) {
        const Component = getComponent(node)
        const Wrapper = collection === 'layouts' ? Layout : Quarantine
        collectionCache[type] = Component && Wrapper(Component)
      }
      return collectionCache[type]
    } else {
      return type || null
    }
  }

  function createElement (node, index) {
    if (!node) {
      return null
    }

    const Component = getComponentFromCache(node)
    if (!Component) {
      return null
    }

    const { children, collection, props, type } = node

    const id = node.fingerprint || node.id || node._id
    const key = node.key || id || index

    const providerProps = {
      key: key || index,
      value: node,
      collection,
      type,
      id
    }

    const componentProps = Component === React.Fragment ? { key } : props

    return React.createElement(
      ComponentContext.Provider,
      providerProps,
      React.createElement(
        Component,
        componentProps,
        children instanceof Object
          ? [].concat(children).map(createElement)
          : children
      )
    )
  }

  return [].concat(tree || []).map(createElement)
}

Tree.propTypes = {
  getComponent: PropTypes.func.isRequired,
  tree: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
}

module.exports = Tree
