'use strict'

const { Router } = require('express')

const render = require('../render')
const resolve = require('../resolve')

function router (options) {
  const router = Router()

  router.use('/dist', require('./dist')(options))

  router.use(async (req, res, next) => {
    try {
      res.send(
        await render(
          await resolve(req.url)
        )
      )
    } catch (err) {
      next(err)
    }
  })

  return router
}

module.exports = router
