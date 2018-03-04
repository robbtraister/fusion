#!/usr/bin/env node

'use strict'

const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

if (process.env.WATCH === 'true') {
  require('shell-watcher')({
    targets: [path.resolve(`${__dirname}/../../lambda`)],
    exts: ['js', 'json']
  })
}

const server = function server (port) {
  const app = express()

  app.use(
    bodyParser.urlencoded({extended: true}),
    // wrap this require in a function to ensure it loads the latest after shell-watcher invalidation
    (req, res, next) => require(`${__dirname}/../../lambda/src/middleware`)(req, res, next)
  )

  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send(err)
  })

  port = port || process.env.PORT || 8080
  return app.listen(port, err => {
    err ? console.error(err) : console.log(`Listening on port: ${port}`)
  })
}

module.exports = server

if (module === require.main) {
  server(...process.argv.slice(2))
}
