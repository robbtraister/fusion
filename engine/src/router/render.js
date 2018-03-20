'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const {
  compileOutputType,
  compileRenderable,
  render
} = require('../react/server/render')

const timer = require('../timer')

const {
  findRenderableItem,
  getPageHead,
  getRendering,
  getTemplateHead
} = require('../renderings')

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

      fetch(payload.id)
        .then(({pt, rendering}) => {
          const renderable = (payload.child)
            ? findRenderableItem(rendering)(payload.child)
            : rendering

          return (payload.child)
            ? compileRenderable(renderable)
            : compileOutputType(renderable, pt)
        })
        .then(Component => render(Object.assign({}, payload, {Component, requestUri: req.originalUrl})))
        .then(data => res.send(data))
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
