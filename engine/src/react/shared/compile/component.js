'use strict'

const React = require('react')

const CATEGORY_DIRECTORIES = {
  chain: 'chains',
  feature: 'features',
  layout: 'layouts'
}

const componentGenerator = function componentGenerator (loadComponent) {
  const renderAll = function renderAll (renderableItems, outputType) {
    return (renderableItems || [])
      .map((ri, i) => renderableItem(ri, outputType, i))
      .filter(ri => ri)
  }

  const getFeature = function getFeature (config, outputType) {
    const Feature = loadComponent(CATEGORY_DIRECTORIES[config.category], config.props.type, outputType)

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

  const getComponent = function getComponent (config, outputType) {
    const category = CATEGORY_DIRECTORIES[config.category]

    const Component = (category)
      ? loadComponent(category, config.props.type, outputType)
      : React.Fragment

    return React.createElement(
      Component || 'div',
      Object.assign(
        { key: config.props.id },
        config.props
      ),
      renderAll(config.children, outputType)
    )
  }

  const renderableItem = function renderableItem (config, outputType) {
    const Component = {
      chain: getComponent,
      feature: getFeature,
      layout: getComponent,
      section: getComponent
    }[config.category]

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
