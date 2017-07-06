#!/usr/bin/env node

'use strict'

// const debug = require('debug')(`fusion:server:${process.pid}`)
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')

const assets = require('./routers/assets')
const content = require('./routers/content')
const render = require('./routers/render')

function server () {
  let app = express()

  app.set('x-powered-by', false)
  app.set('etag', true)

  app.use(morgan('dev'))

  if (!process.env.NGINX_PORT) {
    app.use(compression())
  }

  app.use('/_assets', assets())
  app.use('/_content', content())
  app.use(render())

  app.use((err, req, res, next) => {
    return res.status(err.status || 500).send(/^prod/i.test(process.env.NODE_ENV) ? '' : err.msg)
  })
  app.use((req, res, next) => {
    return res.sendStatus(404)
  })

  const port = process.env.NODEJS_PORT || process.env.PORT || 8080
  return app.listen(port, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`Listening on port: ${port}`)
    }
  })
}

module.exports = server

if (module === require.main) {
  server()
}
