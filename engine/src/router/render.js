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
    bodyParser.json({ limit: bodyLimit }),
    bodyParser.urlencoded({ extended: true }),
    (req, res, next) => {
      const tic = timer.tic()

      const content = (req.body && req.body.content)

      const request = Object.assign(
        {
          arcSite: req.query._website
        },
        (req.body && req.body.request) || {}
      )

      const renderingJson = (req.body && req.body.rendering)
      const rendering = Object.assign(
        {
          id: req.params.id,
          child: req.params.child,
          outputType: /^(false|none|off|0)$/i.test(req.query.outputType)
            ? null
            : req.query.outputType || defaultOutputType
        },
        // support POST from an HTML form
        (typeof renderingJson === 'string')
          ? JSON.parse(renderingJson)
          : renderingJson
      )

      const type = rendering.type || routeType

      new Rendering(type, rendering.id, rendering.layoutItems ? rendering : undefined)
        .render({ content, rendering, request })
        .then(html => `${rendering.outputType ? '<!DOCTYPE html>' : ''}${html}`)
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
