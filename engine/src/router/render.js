'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const render = require('../react/render')

const timer = require('../timer')

const {
  findRenderableItem,
  getPageHead,
  getRendering,
  getTemplateHead
} = require('../renderings')

const renderRouter = express.Router()

function getTypeRouter (compiler) {
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

      compiler(payload.id)
        .then(rendering => payload.child
          ? findRenderableItem(rendering)(payload.child)
          : rendering
        )
        .then(rendering => render(Object.assign({}, payload, {rendering, requestUri: req.originalUrl})))
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
