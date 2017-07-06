'use strict'

const path = require('path')

const express = require('express')

function router () {
  let router = express.Router()

  // for some reason, express static requires a non-zero maxAge for etags to work
  router.use(express.static(path.join(__dirname, '..', '..', '..', 'dist'), {etag: true, maxAge: process.env.CACHE_MAX_AGE * 1000}))
  router.use(express.static(path.join(__dirname, '..', '..', '..', 'resources'), {etag: true, maxAge: process.env.CACHE_MAX_AGE * 1000}))

  return router
}

module.exports = router
