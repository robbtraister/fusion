'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const render = require('../react/render')

const timer = require('../timer')

const { getPageRendering, getTemplateRendering } = require('../renderings')

const renderRouter = express.Router()

function getTypeRouter (compiler) {
  const typeRouter = express.Router()
  typeRouter.all(['/', '/:id'],
    bodyParser.json(),
    (req, res, next) => {
      const tic = timer.tic()
      const payload = Object.assign(
        {id: req.params.id},
        req.body
      )

      compiler(payload.id)
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

renderRouter.use('/page', getTypeRouter(getPageRendering))
renderRouter.use('/template', getTypeRouter(getTemplateRendering))

module.exports = renderRouter
