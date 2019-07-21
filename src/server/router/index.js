'use strict'

const express = require('express')

const render = require('../render')
const resolve = require('../resolve')

function router (options) {
  const router = express.Router()

  router.use(require('./assets')(options))

  router.use('/api', require('./api')(options))

  router.use(async (req, res, next) => {
    try {
      res.send(await render(await resolve(req.path, req.query)))
    } catch (err) {
      next(err)
    }
  })

  return router
}

module.exports = router
