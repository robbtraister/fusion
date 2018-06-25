'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const Rendering = require('../models/rendering')

const {
  fetchFile
} = require('../assets/io')

const {
  bodyLimit,
  defaultOutputType,
  distRoot,
  isDev
} = require('../../environment')

const distRouter = express.Router()

const staticHandler = (isDev)
  ? (location) => express.static(`${distRoot}${location || ''}`)
  : (location) => (req, res, next) =>
    fetchFile(`${location || ''}${req.path}`)
      .then(src => { res.send(src) })
      .catch(() => next())

distRouter.use('/engine', staticHandler('/engine'))
distRouter.all(/\.css$/, staticHandler())

// if POSTed, we will re-generate
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
    typeRouter.post(['/', '/:id'],
      bodyParser.json({limit: bodyLimit}),
      (req, res, next) => {
        const id = req.params.id || req.body.id
        const type = req.body.type || routeType

        new Rendering(type, id, req.body)
          .publish(req.query.propagate !== 'false')
          .then(() => { res.sendStatus(200) })
          .catch(next)
      }
    )
  }

  return typeRouter
}

distRouter.use('/page', getTypeRouter('page', true))
distRouter.use('/rendering', getTypeRouter('rendering'))
distRouter.use('/template', getTypeRouter('template', true))

module.exports = distRouter
