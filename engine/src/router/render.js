'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const {
  bodyLimit,
  defaultOutputType
} = require('../../environment')

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
    (req, res, next) => {
      const tic = timer.tic()

      const outputType = /^(false|none|off|0)$/i.test(req.query.outputType)
        ? null
        : req.query.outputType || defaultOutputType

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
            req.body && req.body.rendering
          )
        }
      )

      const type = payload.rendering.type || routeType

      const rendering = new Rendering(type, payload.rendering.id)
      return Promise.all([
        rendering.getComponent(outputType, payload.rendering.child),
        rendering.getContent()
      ])
        // template will already have content populated by resolver
        // use Object.assign to default to the resolver content
        .then(([Component, content]) => render(Object.assign({content}, payload, {Component})))
        .then(data => { res.send(`${outputType ? '<!DOCTYPE html>' : ''}${data}`) })
        .then(() => {
          debugTimer('complete response', tic.toc())
        })
        .catch(next)
    }
  )

  return typeRouter
}

renderRouter.use('/page', getTypeRouter('page'))
renderRouter.use('/rendering', getTypeRouter('rendering'))
renderRouter.use('/template', getTypeRouter('template'))

renderRouter.use('/', getTypeRouter())

module.exports = renderRouter
