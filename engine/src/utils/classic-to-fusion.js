'use strict'

const getTree = require('../engines/_shared/rendering-to-tree')

function classicToFusion ({ outputType, rendering }) {
  const result = {
    meta: rendering.meta,
    outputType,
    tree: getTree({ outputType, rendering }) || rendering
  }

  const globalContentConfig = rendering && rendering.globalContentConfig
  if (globalContentConfig) {
    const { contentService, contentConfigValues } = globalContentConfig
    result.globalContentConfig = { source: contentService, query: contentConfigValues }
  }

  return result
}

module.exports = classicToFusion
