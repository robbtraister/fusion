'use strict'

const React = require('react')

const componentGenerator = function componentGenerator (loadComponent) {
  const renderAll = function renderAll (renderableItems, outputType) {
    return (renderableItems || [])
      .map((ri, i) => renderableItem(ri, outputType, i))
      .filter(ri => ri)
  }

  const getFeature = function getFeature (config, outputType) {
    const Feature = loadComponent(config.collection, config.props.type, outputType)

    return (Feature)
      ? React.createElement(
        Feature,
        config.props
      )
      : React.createElement(
        'div',
        {
          key: config.props.id,
          type: config.props.type,
          id: config.props.id,
          name: config.props.name,
          dangerouslySetInnerHTML: { __html: `<!-- feature "${config.props.type}" could not be found -->` }
        }
      )
  }

  const getComponent = (defaultComponent = 'div') => (config, outputType) => {
    const Component = loadComponent(config.collection, config.props.type, outputType)
    return React.createElement(
      Component || defaultComponent,
      config.props,
      renderAll(config.children, outputType)
    )
  }

  const componentMap = {
    chains: getComponent(),
    features: getFeature,
    layouts: getComponent(),
    sections: getComponent(React.Fragment)
  }

  const renderableItem = function renderableItem (config, outputType) {
    const Component = componentMap[config.collection]

    const Element = (Component)
      ? Component(config, outputType)
      : null

    return Element || (() => null)
  }

  return (config, outputType) => {
    // The calculated result we export for rendering must be a Component (not Element)
    // Also, react elements cannot be extended, so using a Component function allows us to add layout property
    const Component = () => renderableItem(config, outputType)

    if (config.layout) {
      Component.layout = config.layout
    }

    return Component
  }
}

module.exports = componentGenerator
