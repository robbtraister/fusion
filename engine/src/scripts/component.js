'use strict'

const {
  fetchRendering
} = require('./io')

const {
  findRenderableItem
} = require('../models/renderings')

const {
  compileDocument,
  compileRenderable
} = require('../react/server/render')

const getComponent = (componentType) => {
  const fetchType = fetchRendering(componentType)

  return (payload) => fetchType(payload)
    .then(({rendering, id}) => {
      const renderable = (payload.child)
        ? findRenderableItem(rendering)(payload.child)
        : rendering

      return (payload.child)
        ? compileRenderable({renderable, outputType: payload.outputType})
        : compileDocument({renderable, outputType: payload.outputType, name: `${componentType}/${id}`})
    })
}

module.exports = {
  getComponent
}
