'use strict'

const React = require('react')

const componentGenerator = function componentGenerator (loadComponent) {
  // The calculated result we export for rendering must be a Component (not Element)
  // For simplification, create each element as a functional component
  // This allows any feature to be exported for rendering
  // When compiling container children, execute the functional Component to get the Element
  const renderAll = function renderAll (renderableItems, outputType) {
    return (renderableItems || [])
      .map((ri, i) => renderableItem(ri, outputType, i)())
      .filter(ri => ri)
  }

  const feature = function feature (config, outputType) {
    const Feature = loadComponent('features', config.featureConfig, outputType)
    if (Feature) {
      const props = {
        key: config.id,
        id: config.id,
        type: config.featureConfig,
        contentConfig: config.contentConfig || {},
        customFields: config.customFields || {}
      }

      // we only need local edits for content consumers, which must be stateful
      if (Feature instanceof React.Component) {
        props.localEdits = config.localEdits || {}
      }

      return () => React.createElement(
        Feature,
        props
      )
    }
  }

  const chain = function chain (config, outputType) {
    const Chain = loadComponent('chains', config.chainConfig, outputType)

    return () => React.createElement(
      Chain || 'div',
      {
        key: config.id,
        id: config.id,
        type: config.chainConfig
      },
      renderAll(config.features, outputType)
    )
  }

  const section = function section (config, outputType, index) {
    return () => React.createElement(
      'section',
      {
        key: index,
        id: index,
        type: 'section'
      },
      renderAll(config.renderableItems, outputType)
    )
  }

  const layout = function layout (rendering, outputType) {
    const Layout = loadComponent('layouts', rendering.layout, outputType)

    return () => React.createElement(
      Layout || 'div',
      {
        key: rendering.id || rendering._id,
        id: rendering.id || rendering._id,
        type: 'rendering'
      },
      renderAll(rendering.layoutItems, outputType)
    )
  }

  const renderableItem = function renderableItem (config, outputType, index) {
    const Component = (config.featureConfig)
      ? feature(config, outputType)
      : (config.chainConfig)
        ? chain(config, outputType)
        : (config.renderableItems)
          ? section(config, outputType, index)
          : (config.layoutItems)
            ? layout(config, outputType)
            : null
    return Component || (() => null)
  }

  return renderableItem
}

module.exports = componentGenerator
