'use strict'

const debugTimer = require('debug')('fusion:timer:renderings')

const model = require('./model')
const Pages = model('page')
const Renderings = model('rendering')
const Templates = model('template')

const timer = require('../timer')

const getRendering = function getRendering (id) {
  return Renderings.then(model => model.findById(id))
    .then(rendering => rendering._doc)
}

const getPageOrTemplateHead = (Collection) => (id) => {
  const tic = timer.tic()

  return Collection.then(model => model.findById(id))
    .then(pt => pt._doc)
    .then(pt => pt.versions[pt.published].head)
    .then(getRendering)
    .then(rendering => {
      debugTimer('fetch rendering', tic.toc())
      return rendering
    })
}

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

const getPageHead = getPageOrTemplateHead(Pages)
const getTemplateHead = getPageOrTemplateHead(Templates)

module.exports = {
  findRenderableItem,
  getPageHead,
  getRendering,
  getTemplateHead
}
