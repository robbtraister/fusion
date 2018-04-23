'use strict'

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const { componentDistRoot } = require('../../../environment')
const timer = require('../../../timer')

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  debugTimer(`render(${props.type}:${props.id})`, tic.toc())
  return result
}

// The calculated result we export for rendering must be a Component (not Element)
// For simplification, create each element as a functional component
// This allows any feature to be exported for rendering
// When compiling container children, execute the functional Component to get the Element
const renderAll = function renderAll (renderableItems, outputType) {
  return (renderableItems || [])
    .map((ri, i) => renderableItem(ri, outputType, i)())
    .filter(ri => ri)
}

const componentFiles = [
  (componentName, outputType) => outputType ? `${componentName}/${outputType}.js` : null,
  (componentName, outputType) => `${componentName}/default.js`,
  (componentName, outputType) => `${componentName}/index.js`,
  (componentName, outputType) => `${componentName}.js`
]

const loadComponent = function loadComponent (componentName, outputType) {
  for (let i = 0; i < componentFiles.length; i++) {
    try {
      return require(componentFiles[i](componentName, outputType))
    } catch (e) {}
  }
  return null
}

const feature = function feature (config, outputType) {
  const Feature = loadComponent(`${componentDistRoot}/features/${config.featureConfig}`, outputType)
  if (Feature) {
    const Component = TimedComponent(Feature)

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
      Component,
      props
    )
  }
}

const chain = function chain (config, outputType) {
  const Chain = loadComponent(`${componentDistRoot}/chains/${config.chainConfig}`, outputType)
  const Component = Chain ? TimedComponent(Chain) : 'div'

  return () => React.createElement(
    Component,
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
  const Layout = loadComponent(`${componentDistRoot}/layouts/${rendering.layout}`, outputType)
  const Component = Layout ? TimedComponent(Layout) : 'div'

  return () => React.createElement(
    Component,
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

module.exports = renderableItem
