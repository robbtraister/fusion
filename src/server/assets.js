'use strict'

const path = require('path')

const express = require('express')

// const hashes = require('./hashes')

function router () {
  let router = express.Router()

  // if (process.env.CACHE_MAX_AGE !== '0') {
  //   router.use((req, res, next) => {
  //     if (req.query.h) {
  //       if (req.query.h === hashes[req.path]) {
  //         res.set('Cache-Control', `max-age=${process.env.CACHE_MAX_AGE || 31536000}`)
  //       }
  //     }
  //     next()
  //   })
  // }

  // for some reason, express static requires a non-zero maxAge for etags to work
  router.use(express.static(path.join(__dirname, '..', '..', 'dist'), {etag: true, maxAge: process.env.CACHE_MAX_AGE * 1000}))
  router.use(express.static(path.join(__dirname, '..', '..', 'resources'), {etag: true, maxAge: process.env.CACHE_MAX_AGE * 1000}))

  return router
}

module.exports = router
