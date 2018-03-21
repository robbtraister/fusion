'use strict'

const bodyParser = require('body-parser')
const express = require('express')

// const debugTimer = require('debug')('fusion:timer:router')

// const timer = require('../timer')

const {
  getPageHead,
  getRendering,
  getTemplateHead
} = require('../renderings')

const {
  compile
} = require('../resources')

const renderRouter = express.Router()

function getTypeRouter (fetch) {
  const typeRouter = express.Router()

  typeRouter.all(['/', '/:id', '/:id/:child'],
    bodyParser.json(),
    (req, res, next) => {
      // const tic = timer.tic()
      const payload = Object.assign(
        {
          id: req.params.id,
          child: req.params.child
        },
        req.body
      )

      fetch(payload.id)
        .then(({pt, rendering}) => compile(pt, rendering, payload.child))
        .then((src) => { res.send(src) })
        .catch(next)
    }
  )

  return typeRouter
}

renderRouter.use('/page', getTypeRouter(getPageHead))
renderRouter.use('/rendering', getTypeRouter(getRendering))
renderRouter.use('/template', getTypeRouter(getTemplateHead))

module.exports = renderRouter