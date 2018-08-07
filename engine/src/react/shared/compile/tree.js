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

const feature = function feature (config, outputType) {
  return {
    type: 'feature',
    props: {
      type: config.featureConfig,
      id: config.id,
      contentConfig: config.contentConfig || {},
      customFields: config.customFields || {},
      // we only need local edits for content consumers, which must be stateful
      localEdits: config.localEdits || {}
    }
  }
}

const chain = function chain (config, outputType) {
  return {
    type: 'chain',
    props: {
      type: config.chainConfig,
      id: config.id
    },
    children: getChildren(config.features, outputType)
  }
}

const section = function section (config, outputType, index) {
  return {
    type: 'section',
    props: {
      id: index
    },
    children: getChildren(config.renderableItems, outputType)
  }
}

const layout = function layout (rendering, outputType) {
  const Layout = (() => {
    try {
      return unpack(require(`${componentDistRoot}/layouts/${rendering.layout}/${outputType || 'default'}`))
    } catch (e) {}
  })()

  return {
    type: 'layout',
    props: {
      type: 'layout',
      id: rendering.layout
    },
    children: getChildren(rendering.layoutItems, outputType, Layout ? Layout.sections.map(s => s.id) : null)
  }
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
  return Component || null
}

module.exports = renderableItem
