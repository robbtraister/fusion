'use strict'

const path = require('path')
const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const {
  bodyLimit,
  defaultOutputType
} = require('../../environment')

const {
  pushHtml
} = require('../io')

const Rendering = require('../models/rendering')

const {
  render
} = require('../react')

const timer = require('../timer')

const renderRouter = express.Router()

function getTypeRouter (routeType) {
  const typeRouter = express.Router()

  typeRouter.all(['/', '/:id', '/:id/:child'],
    bodyParser.json({limit: bodyLimit}),
    bodyParser.urlencoded({extended: true}),
    (req, res, next) => {
      const tic = timer.tic()

      const cacheRender = req.get('Fusion-Render-Cache') === 'true'

      const outputType = /^(false|none|off|0)$/i.test(req.query.outputType)
        ? null
        : req.query.outputType || defaultOutputType

      const renderingJson = (req.body && req.body.rendering)
      const renderingTree = (typeof renderingJson === 'string')
        ? JSON.parse(renderingJson)
        : renderingJson

      const payload = Object.assign(
        {
          _website: req.query._website
        },
        req.body,
        {
          rendering: Object.assign(
            {
              id: req.params.id,
              child: req.params.child,
              outputType
            },
            renderingTree
          )
        }
      )

      const type = payload.rendering.type || routeType

      const rendering = new Rendering(type, payload.rendering.id, payload.rendering.layoutItems ? payload.rendering : undefined)
      return Promise.all([
        rendering.getComponent(outputType, payload.rendering.child),
        rendering.getContent(payload._website)
      ])
        // template will already have content populated by resolver
        // use Object.assign to default to the resolver content
        .then(([Component, content]) => render(Object.assign({content}, payload, {Component})))
        .then((html) => `${outputType ? '<!DOCTYPE html>' : ''}${html}`)
        .then((html) => {
          return (cacheRender && payload.request && payload.request.uri)
            ? Promise.resolve(url.parse(payload.request.uri).pathname)
              .then((pathname) => /\/$/.test(pathname) ? path.join(pathname, 'index.html') : pathname)
              .then((filePath) => pushHtml(filePath, html))
              .then(() => html)
            : html
        })
        .then((html) => { res.send(html) })
        .then(() => {
          debugTimer('complete response', tic.toc())
        })
        .catch(next)
    }
  )

  return typeRouter
}

renderRouter.use('/page', getTypeRouter('page'))
// renderRouter.use('/rendering', getTypeRouter('rendering'))
renderRouter.use('/template', getTypeRouter('template'))

renderRouter.use('/', getTypeRouter())

module.exports = renderRouter
