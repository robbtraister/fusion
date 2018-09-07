'use strict'

const unpack = require('../../../utils/unpack')

const {
  componentDistRoot
} = require('../../../../environment')

const getChildren = function getChildren (renderableItems, outputType, indices) {
  return (renderableItems || [])
    .map((ri, i) => renderableItem(ri, outputType, (indices && i < indices.length) ? indices[i] : i))
    .filter(ri => ri)
}

const feature = function feature (config, outputType, id) {
  id = (id == null) ? config.id : id
  return {
    collection: 'features',
    props: {
      key: id,
      type: config.featureConfig,
      id,
      name: config.name,
      contentConfig: config.contentConfig || {},
      customFields: config.customFields || {},
      displayProperties: (config.displayProperties || {})[outputType] || {},
      // we only need local edits for content consumers, which must be stateful
      localEdits: config.localEdits || {}
    }
  }
}

const chain = function chain (config, outputType, id) {
  id = (id == null) ? config.id : id
  return {
    collection: 'chains',
    props: {
      key: id,
      type: config.chainConfig,
      id,
      name: config.name
    },
    children: getChildren(config.features, outputType)
  }
}

const section = function section (config, outputType, id) {
  return {
    collection: 'sections',
    props: {
      key: id
    },
    children: getChildren(config.renderableItems, outputType)
  }
}

const layout = function layout (config, outputType, id) {
  const Layout = (() => {
    try {
      return unpack(require(`${componentDistRoot}/layouts/${config.layout}/${outputType || 'default'}`))
    } catch (e) {}
  })()

  return {
    collection: 'layouts',
    props: {
      key: config.layout,
      type: config.layout
    },
    children: getChildren(config.layoutItems, outputType, Layout ? Layout.sections.map(section => section.id) : null)
  }
}

const renderableItem = function renderableItem (config, outputType, id) {
  const Component = (config.featureConfig)
    ? feature(config, outputType)
    : (config.chainConfig)
      ? chain(config, outputType)
      : (config.renderableItems)
        ? section(config, outputType, id)
        : (config.layoutItems)
          ? layout(config, outputType)
          : null
  return Component || null
}

module.exports = renderableItem
