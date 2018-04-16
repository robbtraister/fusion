'use strict'

const model = require('./dao')
const Pages = model('page')
const Renderings = model('rendering')
const Templates = model('template')

const getRenderingById = function getRenderingById (id) {
  return Renderings.findById(id)
}

const getRendering = function getRendering (id) {
  return getRenderingById(id)
    .then((rendering) => {
      return (rendering)
        ? Promise.all([
          Pages.findById(rendering._pt),
          Templates.findById(rendering._pt)
        ])
          .then(([page, template]) => ({
            pt: template || page,
            rendering
          }))
        : {
          pt: null,
          rendering: null
        }
    })
}

const getRenderingFromPageOrTemplate = function getRenderingFromPageOrTemplate (pt) {
  return (pt)
    ? getRenderingById(pt.versions[pt.published].head)
      .then((rendering) => ({
        pt,
        rendering
      }))
    : {
      pt: null,
      rendering: null
    }
}

const getPageOrTemplateHead = (Collection) => (id) => {
  return Collection.findById(id)
    .then(getRenderingFromPageOrTemplate)
}

const getPageByName = function getPageByName (name) {
  const uri = name.replace(/^\/*/, '/').replace(/\/*$/, '/')
  return Pages.findOne({uri})
    .then(getRenderingFromPageOrTemplate)
}

const getTemplateByName = function getTemplateByName (name) {
  return Templates.findById(name)
    .then(getRenderingFromPageOrTemplate)
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
  getPageByName,
  getPageHead,
  getRendering,
  getTemplateByName,
  getTemplateHead
}
