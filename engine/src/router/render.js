'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const {
  render
} = require('../react/server/render')

const { getComponent } = require('../scripts/component')

const timer = require('../timer')

const renderRouter = express.Router()

function getTypeRouter (getComponent) {
  const typeRouter = express.Router()

  typeRouter.all(['/', '/:id', '/:id/:child'],
    bodyParser.json(),
    (req, res, next) => {
      const tic = timer.tic()

      const outputType = /^(false|none|off|0)$/i.test(req.query.outputType)
        ? null
        : req.query.outputType || undefined
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

      getComponent(payload.rendering)
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

renderRouter.use('/page', getTypeRouter(getComponent('page')))
renderRouter.use('/rendering', getTypeRouter(getComponent('rendering')))
renderRouter.use('/template', getTypeRouter(getComponent('template')))

renderRouter.use('/', getTypeRouter((templateInfo) => getComponent(templateInfo.type)(templateInfo)))

module.exports = renderRouter
