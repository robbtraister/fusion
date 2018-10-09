'use strict'

const path = require('path')
const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')

const debug = require('debug')('fusion:router:render')

const debugTimer = require('debug')('fusion:timer:router')

const {
  bodyLimit,
  defaultOutputType
} = require('../../environment')

const {
  pushHtml
} = require('../io')

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

      const cacheMode = req.get('Fusion-Cache-Mode')
      debug(`cache mode: ${cacheMode}`)
      const writeToCache = cacheMode !== 'none'

      const content = (req.body && req.body.content)

      const outputType = /^(false|none|off|0)$/i.test(req.query.outputType)
        ? null
        : req.query.outputType || defaultOutputType

      const renderingJson = (req.body && req.body.rendering)
      const rendering = Object.assign(
        {
          id: req.params.id,
          child: req.params.child,
          outputType
        },
        // support POST from an HTML form
        (typeof renderingJson === 'string')
          ? JSON.parse(renderingJson)
          : renderingJson
      )

      const request = Object.assign(
        {
          arcSite: req.query._website
        },
        (req.body && req.body.request) || {}
      )

      const type = rendering.type || routeType

      new Rendering(type, rendering.id, rendering.layoutItems ? rendering : undefined)
        .render({ content, rendering, request })
        .then((html) => `${outputType ? '<!DOCTYPE html>' : ''}${html}`)
        .then((html) =>
          (writeToCache && request.uri)
            ? Promise.resolve(url.parse(request.uri).pathname)
              .then((pathname) => pathname.replace(/\/$/, ''))
              .then((filePath) => pushHtml(path.join(request.arcSite || 'default', outputType, filePath), html))
              .then(() => html)
            : html
        )
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
