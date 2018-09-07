'use strict'

const React = require('react')

const componentGenerator = function componentGenerator (loadComponent) {
  const renderAll = function renderAll (renderableItems, outputType) {
    return (renderableItems || [])
      .map((ri, i) => renderableItem(ri, outputType, i))
      .filter(ri => ri)
  }

  const getFeature = function getFeature (node, outputType) {
    const Feature = loadComponent(node.collection, node.type, outputType)

    return (Feature)
      ? React.createElement(
        Feature,
        node.props
      )
      : React.createElement(
        'div',
        {
          key: node.props.id,
          type: node.props.type,
          id: node.props.id,
          name: node.props.name,
          dangerouslySetInnerHTML: { __html: `<!-- feature "${node.type}" could not be found -->` }
        }
      )
  }

  const getComponent = (defaultComponent = 'div') => (node, outputType) => {
    const Component = loadComponent(node.collection, node.type, outputType) ||
      defaultComponent

    const props = (Component === React.Fragment)
      ? { key: node.props.key || node.props.id }
      : node.props

    return React.createElement(
      Component,
      props,
      renderAll(node.children, outputType)
    )
  }

  const collectionMap = {
    chains: getComponent(),
    features: getFeature,
    layouts: getComponent(),
    sections: getComponent(React.Fragment)
  }

  const renderableItem = function renderableItem (node, outputType) {
    const Component = collectionMap[node.collection]

    const Element = (Component)
      ? Component(node, outputType)
      : null

    return Element || (() => null)
  }

  return (node, outputType) => {
    // The calculated result we export for rendering must be a Component (not Element)
    // Also, react elements cannot be extended, so using a Component function allows us to add layout property
    const Component = () => renderableItem(node, outputType)

    if (node.layout) {
      Component.layout = node.layout
    }

    return Component
  }
}

module.exports = componentGenerator
