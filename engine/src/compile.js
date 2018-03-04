#!/usr/bin/env node

'use strict'

const React = require('react')

const componentRoot = process.env.COMPONENT_ROOT || '../dist/components'

const renderAll = function renderAll (renderableItems) {
  return (renderableItems || [])
    .map(renderableItem)
    .filter(ri => ri)
}

const feature = function feature (config) {
  const contentConfigValues = (config.contentConfig && config.contentConfig.contentConfigValues) || {}
  const customFields = config.customFields || {}

  try {
    const component = require(`${componentRoot}/${config.featureConfig}.jsx`)
    return React.createElement(
      component,
      Object.assign({key: config.id, featureId: config.id}, customFields, contentConfigValues)
    )
  } catch (e) {
    // console.error(e)
    return null
  }
}

const chain = function chain (config) {
  const component = (() => {
    try {
      return require(`${componentRoot}/${config.chainConfig}.jsx`)
    } catch (e) {
      return 'div'
    }
  })()

  return React.createElement(
    component,
    {key: config.id},
    renderAll(config.features)
  )
}

const renderableItem = function renderableItem (config) {
  return (config.featureConfig) ? feature(config)
    : (config.chainConfig) ? chain(config)
    : null
}

const layoutItem = function layoutItem (config) {
  return renderAll(config.renderableItems)
}

const layout = function layout (config, item) {
  const props = {}
  if (config.id) props.id = config.id
  if (config.cssClass) props.className = config.cssClass

  return React.createElement(
    'section',
    props,
    layoutItem(item)
  )
}

const compile = function compile (rendering) {
  rendering = rendering || require('./rendering.json')
  return (props) => React.createElement(
    'div',
    props,
    rendering.layoutItems.map((item, i) => {
      return (rendering.layout && rendering.layout.sections)
        ? layout(rendering.layout.sections[i], item)
        : renderableItem(item)
    })
  )
}

module.exports = compile
