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
    const key = config.id
    const id = config.id
    const type = config.featureConfig

    const Feature = loadComponent('features', type, outputType)

    return (Feature)
      ? () => React.createElement(
        Feature,
        {
          key,
          type,
          id,
          contentConfig: config.contentConfig || {},
          customFields: config.customFields || {},
          displayProperties: (config.displayProperties || {})[outputType] || {},
          // we only need local edits for content consumers, which must be stateful
          localEdits: (Feature instanceof React.Component)
            ? config.localEdits || {}
            : undefined
        }
      )
      : () => React.createElement(
        'div',
        {
          key,
          type,
          id,
          dangerouslySetInnerHTML: { __html: `<!-- feature "${type}" could not be found -->` }
        }
      )
  }

  const chain = function chain (config, outputType) {
    const Chain = loadComponent('chains', config.chainConfig, outputType)

    return () => React.createElement(
      Chain || 'div',
      {
        key: config.id,
        type: config.chainConfig,
        id: config.id,
        displayProperties: (config.displayProperties || {})[outputType] || {}
      },
      renderAll(config.features, outputType)
    )
  }

  const section = function section (config, outputType, index) {
    return () => React.createElement(
      React.Fragment,
      {
        key: index
        // type: 'section',
        // id: index
      },
      renderAll(config.renderableItems, outputType)
    )
  }

  const layout = function layout (rendering, outputType) {
    const Layout = loadComponent('layouts', rendering.layout, outputType)

    const Component = () => React.createElement(
      Layout || 'div',
      {
        key: rendering.layout,
        type: 'layout',
        id: rendering.layout
      },
      renderAll(rendering.layoutItems, outputType)
    )

    Component.layout = rendering.layout

    return Component
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
