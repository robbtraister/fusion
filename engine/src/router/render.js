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
    async (req, res, next) => {
      try {
        const tic = timer.tic()

        const isAdmin = req.query.isAdmin === 'true'
        const cacheMode = req.get('Fusion-Cache-Mode')
        debug(`cache mode: ${cacheMode}`)
        const writeToCache = !isAdmin && /^(allowed|preferr?ed|update)$/i.test(cacheMode)

        const content = (req.body && req.body.content)

        const outputType = /^(false|none|off|0)$/i.test(req.query.outputType)
          ? null
          : req.query.outputType || defaultOutputType

        const renderingJson = (req.body && req.body.rendering)
        const rendering = Object.assign(
          {
            id: req.params.id,
            child: req.params.child,
            outputType,
            isAdmin
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

        const model = new Rendering(type, rendering.id, rendering.layoutItems ? rendering : undefined)
        const prefix = (outputType)
          ? '<!DOCTYPE html>'
          : ''
        const html = `${prefix}${await model.render({ content, rendering, request })}`
        debugTimer('complete response', tic.toc())

        if (writeToCache && request.uri) {
          const filePath = url.parse(request.uri).pathname.replace(/\/$/, '')
          await pushHtml(path.join(request.arcSite || 'default', outputType, filePath), html)
        }

        res.send(html)
      } catch (e) {
        next(e)
      }
    }
  )

  return typeRouter
}

renderRouter.use('/page', getTypeRouter('page'))
// renderRouter.use('/rendering', getTypeRouter('rendering'))
renderRouter.use('/template', getTypeRouter('template'))

renderRouter.use('/', getTypeRouter())

module.exports = renderRouter
