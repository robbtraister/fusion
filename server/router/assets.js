'use strict'

const express = require('express')

function assets () {
  const router = express.Router()

  router.use(express.static(`${__dirname}/../../dist`))

  router.use((req, res, next) => {
    res.sendStatus(404)
  })

  return router
}

module.exports = assets
