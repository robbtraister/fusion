'use strict'

const {
  defaultOutputType
} = require('../../../environment')

const {
  compileDocument,
  compileRenderable
} = require('../../react/server/render')

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

const getComponent = function getComponent ({name, rendering, outputType = defaultOutputType, child}) {
  return (child)
    ? rendering.getJson()
      .then((json) => findRenderableItem(json)(child))
      .then((renderable) => compileRenderable({renderable, outputType}))
    : compileDocument({name, rendering, outputType})
}

module.exports = getComponent
