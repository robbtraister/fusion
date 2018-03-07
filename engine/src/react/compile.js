'use strict'

const path = require('path')

const React = require('react')

const componentRoot = path.resolve(process.env.COMPONENT_ROOT || `${__dirname}/../../dist/components`)

const renderAll = function renderAll (renderableItems) {
  return (renderableItems || [])
    .map(renderableItem)
    .filter(ri => ri)
}

const feature = function feature (config) {
  const contentConfigValues = (config.contentConfig && config.contentConfig.contentConfigValues) || {}
  const customFields = config.customFields || {}

  try {
    const component = require(`${componentRoot}/features/${config.featureConfig}.jsx`)
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
      return require(`${componentRoot}/chains/${config.chainConfig}.jsx`)
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

const section = function section (config) {
  return React.createElement(
    'section',
    {},
    renderAll(config.renderableItems)
  )
}

const renderableItem = function renderableItem (config) {
  return (config.featureConfig) ? feature(config)
    : (config.chainConfig) ? chain(config)
      : (config.renderableItems) ? section(config)
        : null
}

const compile = function compile (rendering) {
  const component = (() => {
    try {
      return require(`${componentRoot}/layouts/${rendering.layout}.jsx`)
    } catch (e) {
      return 'div'
    }
  })()

  return (props) => React.createElement(
    component,
    props,
    rendering.layoutItems.map(renderableItem)
  )
}

module.exports = compile
