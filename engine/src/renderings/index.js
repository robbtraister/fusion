'use strict'

const debugTimer = require('debug')('fusion:timer:renderings')

const model = require('./schemaless')
const Pages = model('page')
const Renderings = model('rendering')
const Templates = model('template')

const timer = require('../timer')

const getRenderingById = function getRenderingById (id) {
  return Renderings.findById(id).then(rendering => ({rendering}))
}

const getRendering = function getRendering (id) {
  return getRenderingById(id)
    .then(({rendering}) => {
      return Promise.all([
        Pages.findById(rendering._pt),
        Templates.findById(rendering._pt)
      ])
        .then(([page, template]) => ({
          pt: template || page,
          rendering
        }))
    })
}

const getPageOrTemplateHead = (Collection) => (id) => {
  const tic = timer.tic()

  return Collection.findById(id)
    .then(pt => {
      return getRenderingById(pt.versions[pt.published].head)
        .then(({rendering}) => {
          debugTimer('fetch rendering', tic.toc())
          return {
            pt,
            rendering
          }
        })
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
