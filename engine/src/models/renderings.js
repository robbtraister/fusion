'use strict'

const model = require('./dao')
const Pages = model('page')
const Renderings = model('rendering')
const Templates = model('template')

const getRendering = function getRendering (id) {
  if (typeof id === 'object') {
    id = id.id
  }

  return Renderings.findById(id)
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
    ? Renderings.findById(pt.versions[pt.published].head)
      .then((rendering) => ({
        pt,
        rendering
      }))
    : Promise.resolve({
      pt: null,
      rendering: null
    })
}

const getPage = function getPage (query) {
  if (typeof query !== 'object') {
    query = {id: query}
  }
  if (query.uri) {
    query.uri = query.uri.replace(/^\/*/, '/').replace(/\/*$/, '/')
  }

  return (
    (query.id)
      ? Pages.findById(query.id)
      : Pages.findOne(query)
  )
    .then(getRenderingFromPageOrTemplate)
}

const getTemplate = function getTemplate (id) {
  if (typeof id === 'object') {
    id = id.id
  }

  return Templates.findById(id)
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

module.exports = {
  findRenderableItem,
  getPage,
  getRendering,
  getTemplate
}
