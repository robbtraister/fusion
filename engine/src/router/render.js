'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const {
  bodyLimit,
  defaultOutputType
} = require('../../environment')

const Rendering = require('../models/rendering')

const timer = require('../timer')

const renderRouter = express.Router()

function getTypeRouter (routeType) {
  const typeRouter = express.Router()

  typeRouter.all(['/', '/:id', '/:id/:child'],
    bodyParser.json({limit: bodyLimit}),
    bodyParser.urlencoded({extended: true}),
    (req, res, next) => {
      const tic = timer.tic()

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
      rendering.render(payload, outputType)
        .then(html => `${outputType ? '<!DOCTYPE html>' : ''}${html}`)
        .then(html => { res.send(html) })
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
