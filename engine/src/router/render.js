'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const {
  compileDocument,
  compileRenderable,
  render
} = require('../react/server/render')

const timer = require('../timer')

const {
  findRenderableItem,
  getPageHead,
  getRendering,
  getTemplateHead
} = require('../models/renderings')

const renderRouter = express.Router()

function getTypeRouter (fetch) {
  const typeRouter = express.Router()

  typeRouter.all(['/', '/:id', '/:id/:child'],
    bodyParser.json(),
    (req, res, next) => {
      const tic = timer.tic()
      const payload = Object.assign(
        {
          id: req.params.id,
          child: req.params.child
        },
        req.body
      )

      const outputType = /^(false|none|off|0)$/i.test(req.query.outputType)
        ? null
        : req.query.outputType || undefined

      fetch(payload.id)
        .then(({pt, rendering}) => {
          const renderable = (payload.child)
            ? findRenderableItem(rendering)(payload.child)
            : rendering

          return (payload.child || outputType === null)
            ? compileRenderable(renderable, outputType)
            : compileDocument(renderable, outputType, pt)
        })
        .then(Component => render(Object.assign({}, payload, {Component})))
        .then(data => { res.send(data) })
        .then(() => {
          debugTimer('complete response', tic.toc())
        })
        .catch(next)
    }
  )

  return typeRouter
}

renderRouter.use('/page', getTypeRouter(getPageHead))
renderRouter.use('/rendering', getTypeRouter(getRendering))
renderRouter.use('/template', getTypeRouter(getTemplateHead))

module.exports = renderRouter
