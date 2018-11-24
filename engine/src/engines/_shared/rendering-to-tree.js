'use strict'

module.exports = ({ outputType, rendering }) => {
  function getChildren (renderableItems, indices) {
    return (renderableItems || [])
      .map((ri, i) => renderableItem(ri, (indices && i < indices.length) ? indices[i] : i))
      .filter(ri => ri)
  }

  function feature (config, id) {
    id = config.id || id
    return {
      collection: 'features',
      type: config.featureConfig,
      props: {
        key: id,
        collection: 'features',
        type: config.featureConfig,
        id,
        name: config.name,
        contentConfig: config.contentConfig || {},
        customFields: config.customFields || {},
        displayProperties: (config.displayProperties || {})[outputType] || {},
        localEdits: config.localEdits || {}
      }
    }
  }

  function chain (config, id) {
    id = config.id || id
    return {
      collection: 'chains',
      type: config.chainConfig,
      props: {
        key: id,
        collection: 'chains',
        type: config.chainConfig,
        id,
        name: config.name,
        customFields: config.customFields || {},
        displayProperties: (config.displayProperties || {})[outputType] || {}
      },
      children: getChildren(config.features)
    }
  }

  function section (config, id) {
    return {
      collection: 'sections',
      props: {
        key: id,
        collection: 'sections',
        id
      },
      children: getChildren(config.renderableItems)
    }
  }

  function layout (config, id) {
    return {
      collection: 'layouts',
      type: config.layout,
      props: {
        key: config.layout,
        collection: 'layouts',
        type: config.layout
      },
      children: getChildren(config.layoutItems)
    }
  }

  function renderableItem (config, id) {
    const Component = (config.featureConfig)
      ? feature(config, id)
      : (config.chainConfig)
        ? chain(config, id)
        : (config.renderableItems)
          ? section(config, id)
          : (config.layoutItems)
            ? layout(config, id)
            : null
    return Component || null
  }

  return renderableItem(rendering)
}
