'use strict'

const path = require('path')

const express = require('express')

const compile = require('../compile')

const { bundleRoot, distRoot } = require('../../../env')

const { getTree } = require(path.join(bundleRoot, 'resolve'))

function distRouter (options) {
  const distRouter = express.Router()

  distRouter.get('*', express.static(distRoot, { fallthrough: true }))
  distRouter.get('/templates/:template/:outputType.js', async (req, res, next) => {
    try {
      const template = req.params.template
      const outputType = req.params.outputType
      const { js } = await compile({
        outputType,
        template,
        tree: await getTree(template)
      })
      res.send(js)
    } catch (err) {
      next(err)
    }
  })
  distRouter.get('*', (req, res, next) => {
    res.sendStatus(404)
  })
  distRouter.use((req, res, next) => {
    res.sendStatus(405)
  })

  return distRouter
}

function resourceRouter (options) {
  const resourceRouter = express.Router()

  resourceRouter.get('*', express.static(path.join(bundleRoot, 'resources'), { fallthrough: false }))
  resourceRouter.use((req, res, next) => { req.sendStatus(405) })

  return resourceRouter
}

function router (options) {
  const router = express.Router()

  router.use('/dist', distRouter(options))
  router.use('/resources', resourceRouter(options))

  return router
}

module.exports = router
