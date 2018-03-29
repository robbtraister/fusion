'use strict'

const path = require('path')

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const timer = require('../../../timer')

const componentRoot = path.resolve(process.env.COMPONENT_ROOT || `${__dirname}/../../../../dist/components`)

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
const renderAll = function renderAll (renderableItems) {
  return (renderableItems || [])
    .map((ri, i) => renderableItem(ri, i)())
    .filter(ri => ri)
}

const feature = function feature (config) {
  const contentConfig = config.contentConfig || {}
  const customFields = config.customFields || {}

  try {
    const component = TimedComponent(require(`${componentRoot}/features/${config.featureConfig}.jsx`))
    const props = Object.assign({key: config.id, id: config.id, type: config.featureConfig}, customFields, contentConfig, {contentConfigValues: JSON.stringify(contentConfig.contentConfigValues)})

    return () => React.createElement(
      component,
      props
    )
  } catch (e) {
    // console.error(e)
    return null
  }
}

const chain = function chain (config) {
  const component = (() => {
    try {
      return TimedComponent(require(`${componentRoot}/chains/${config.chainConfig}.jsx`))
    } catch (e) {
      return 'div'
    }
  })()

  return () => React.createElement(
    component,
    {key: config.id, id: config.id, type: config.chainConfig},
    renderAll(config.features)
  )
}

const section = function section (config, index) {
  return () => React.createElement(
    'section',
    {key: index},
    renderAll(config.renderableItems)
  )
}

const template = function template (rendering) {
  const component = (() => {
    try {
      return require(`${componentRoot}/layouts/${rendering.layout}.jsx`)
    } catch (e) {
      return 'div'
    }
  })()

  const children = renderAll(rendering.layoutItems)

  return () => React.createElement(
    component,
    {},
    children
  )
}

const renderableItem = function renderableItem (config, index) {
  const component = (config.featureConfig)
    ? feature(config)
    : (config.chainConfig)
      ? chain(config)
      : (config.renderableItems)
        ? section(config, index)
        : (config.layoutItems)
          ? template(config)
          : null
  return component || (() => null)
}

module.exports = renderableItem
