'use strict'

const { Router } = require('express')

const resolve = require('../resolve')

function router (options) {
  const router = Router()

  router.use('/resolve', async (req, res, next) => {
    res.send(await resolve(req.query.uri, req.query))
  })

  return router
}

module.exports = router
