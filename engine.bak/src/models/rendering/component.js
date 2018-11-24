'use strict'

const {
  defaultOutputType
} = require('../../../environment')

const {
  compileDocument,
  compileRenderable
} = require('../../react')

const getAllRenderables = function getAllRenderables (rendering) {
  const children = [].concat(
    rendering.layoutItems || [],
    rendering.renderableItems || [],
    rendering.features || []
  )
  return [rendering].concat(
    children,
    ...children.map(getAllRenderables)
  )
}

const findRenderableItem = (rendering) => (childId) => {
  return getAllRenderables(rendering).find(renderableItem => renderableItem.id === childId)
}

const compileChild = async function compileChild ({ rendering, outputType = defaultOutputType, child, isAdmin, quarantine }) {
  const json = await rendering.getJson()
  const renderable = await findRenderableItem(json)(child)
  return compileRenderable({ renderable, outputType, inlines: rendering.inlines, contentCache: rendering.contentCache, isAdmin, quarantine })
}

const getComponent = async function getComponent ({ name, rendering, outputType = defaultOutputType, child, isAdmin, quarantine }) {
  const component = (child)
    ? compileChild({ rendering, outputType, child, isAdmin, quarantine })
    : compileDocument({ name, rendering, outputType, inlines: rendering.inlines, contentCache: rendering.contentCache, isAdmin, quarantine })

  return Object.assign(await component, { outputType })
}

module.exports = getComponent
