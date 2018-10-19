'use strict'

const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')

const Rendering = require('../models/rendering')

const {
  bodyLimit,
  bundleBuildRoot,
  defaultOutputType,
  deployment,
  isDev
} = require('../../environment')

const distRouter = express.Router()

const staticHandler = (location) => express.static(`${bundleBuildRoot}${location || ''}`)
const redirectHandler = (location) => {
  const useStatic = staticHandler(location)
  return (req, res, next) => {
    if (req.query.v === deployment) {
      useStatic(req, res, next)
    } else {
      const urlParts = url.parse(req.originalUrl, true)
      delete urlParts.search
      urlParts.query.v = deployment
      res.redirect(url.format(urlParts))
    }
  }
}

const assetHandler = (isDev)
  ? staticHandler
  : redirectHandler

const publishMethod = (isDev)
  ? 'compileAll'
  : 'publish'

distRouter.use('/engine', assetHandler('/engine'))
distRouter.all(/\.css$/, assetHandler())

// if POSTed, we will re-generate
distRouter.get(/\.js$/, assetHandler())

function getTypeRouter (routeType, allowPost) {
  const typeRouter = express.Router()

  typeRouter.get('/:id/:outputType.js',
    async (req, res, next) => {
      try {
        const id = req.params.id
        const type = routeType

        const rendering = new Rendering(type, id)
        const src = await rendering.getScript(req.params.outputType || defaultOutputType)
        res.set('Content-Type', 'application/javascript')
        res.send(src)
      } catch (e) {
        next(e)
      }
    }
  )

  if (allowPost) {
    const publishRenderingHandlers = [
      bodyParser.json({ limit: bodyLimit }),
      async (req, res, next) => {
        try {
          const id = req.params.id || req.body.id || req.body._id
          const type = req.body.type || routeType

          const rendering = new Rendering(type, id, req.body)
          await rendering[publishMethod](!isDev && req.query.propagate !== 'false')
          res.sendStatus(200)
        } catch (e) {
          next(e)
        }
      }
    ]

    typeRouter.route(['/', '/:id'])
      .post(publishRenderingHandlers)
      .put(publishRenderingHandlers)

    const publishOutputTypeHandlers = [
      bodyParser.json({ limit: bodyLimit }),
      async (req, res, next) => {
        try {
          const id = req.params.id || req.body.id || req.body._id
          const type = req.body.type || routeType
          const outputType = req.params.outputType || defaultOutputType

          const rendering = new Rendering(type, id, req.body)
          await rendering.compile(outputType)
          res.sendStatus(200)
        } catch (e) {
          next(e)
        }
      }
    ]

    typeRouter.route(['/:id/:outputType.js', '/:id/:outputType'])
      .post(publishOutputTypeHandlers)
      .put(publishOutputTypeHandlers)
  }

  return typeRouter
}

distRouter.use('/page', getTypeRouter('page', true))
distRouter.use('/rendering', getTypeRouter('rendering'))
distRouter.use('/template', getTypeRouter('template', true))

if (!isDev) {
  distRouter.post('/compile',
    async (req, res, next) => {
      await Promise.all([
        Rendering.compile('page'),
        Rendering.compile('template')
      ])

      res.send(200)
    })
}

module.exports = distRouter
