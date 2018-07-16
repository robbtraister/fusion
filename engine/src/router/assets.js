'use strict'

const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')

const Rendering = require('../models/rendering')

const {
  bodyLimit,
  defaultOutputType,
  distRoot,
  isDev,
  version
} = require('../../environment')

const distRouter = express.Router()

const staticHandler = (location) => express.static(`${distRoot}${location || ''}`)
const redirectHandler = (location) => {
  const useStatic = staticHandler(location)
  return (req, res, next) => {
    if (req.query.v === version) {
      useStatic(req, res, next)
    } else {
      const urlParts = url.parse(req.originalUrl, true)
      delete urlParts.search
      urlParts.query.v = version
      res.redirect(url.format(urlParts))
    }
  }
}

const assetHandler = (isDev)
  ? staticHandler
  : redirectHandler

distRouter.use('/engine', assetHandler('/engine'))
distRouter.all(/\.css$/, assetHandler())

// if POSTed, we will re-generate
// don't redirect to S3 in case we have to generate
distRouter.get(/\.js$/, staticHandler())

function getTypeRouter (routeType, allowPost) {
  const typeRouter = express.Router()

  typeRouter.get('/:id/:outputType.js',
    (req, res, next) => {
      const id = req.params.id
      const type = routeType

      new Rendering(type, id)
        .getScript(req.params.outputType || defaultOutputType)
        .then((src) => { res.set('Content-Type', 'application/javascript').send(src) })
        .catch(next)
    }
  )

  if (allowPost) {
    const writeHandlers = [
      bodyParser.json({limit: bodyLimit}),
      (req, res, next) => {
        const id = req.params.id || req.body.id
        const type = req.body.type || routeType

        new Rendering(type, id, req.body)
          .publish(!isDev && req.query.propagate !== 'false')
          .then(() => { res.sendStatus(200) })
          .catch(next)
      }
    ]

    typeRouter.route(['/', '/:id'])
      .post(writeHandlers)
      .put(writeHandlers)
  }

  return typeRouter
}

distRouter.use('/page', getTypeRouter('page', true))
distRouter.use('/rendering', getTypeRouter('rendering'))
distRouter.use('/template', getTypeRouter('template', true))

module.exports = distRouter
