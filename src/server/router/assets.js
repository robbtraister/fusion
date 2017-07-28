'use strict'

const path = require('path')

const express = require('express')

function router () {
  return [
    express.static(path.join(__dirname, '..', '..', '..', 'dist'), {etag: true, maxAge: process.env.CACHE_MAX_AGE * 1000}),
    express.static(path.join(__dirname, '..', '..', '..', 'resources'), {etag: true, maxAge: process.env.CACHE_MAX_AGE * 1000})
  ]
}

module.exports = router
