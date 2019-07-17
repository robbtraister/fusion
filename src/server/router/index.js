'use strict'

const { Router } = require('express')

const render = require('../render')

function router (options) {
  const router = Router()

  router.use('/dist', require('./dist')(options))

  router.use(async (req, res, next) => {
    try {
      res.send(await render())
    } catch (err) {
      next(err)
    }
  })

  return router
}

module.exports = router
