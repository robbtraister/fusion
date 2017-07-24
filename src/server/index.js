#!/usr/bin/env node

'use strict'

// const debug = require('debug')(`fusion:server:${process.pid}`)
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')

const router = require('./router')

function serve (port) {
  let app = express()

  app.set('x-powered-by', false)
  app.set('etag', true)

  app.use(morgan('dev'))

  if (!process.env.NGINX_PORT) {
    app.use(compression())
  }

  app.use(router())

  app.use((err, req, res, next) => {
    console.error(err.stack)
    return res.status(err.status || 500).send(/^prod/i.test(process.env.NODE_ENV) ? '' : err.message)
  })
  app.use((req, res, next) => {
    return res.sendStatus(404)
  })

  port = port || process.env.NODEJS_PORT || process.env.PORT || 8080
  return app.listen(port, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`Listening on port: ${port}`)
    }
  })
}

module.exports = serve

if (module === require.main) {
  serve(process.argv[2])
}
