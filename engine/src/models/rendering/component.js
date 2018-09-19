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

const getComponent = function getComponent ({name, rendering, outputType = defaultOutputType, child, quarantine}) {
  return (
    (child)
      ? rendering.getJson()
        .then((json) => findRenderableItem(json)(child))
        .then((renderable) => compileRenderable({renderable, outputType, inlines: rendering.inlines, contentCache: rendering.contentCache, quarantine}))
      : compileDocument({name, rendering, outputType, inlines: rendering.inlines, contentCache: rendering.contentCache, quarantine})
  ).then(component => Object.assign(component, {outputType}))
}

module.exports = getComponent
