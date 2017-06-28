#!/usr/bin/env node

'use strict'

require('babel-core/register')

const path = require('path')

const debug = require('debug')(`fusion:server:${process.pid}`)
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')

const content = require('./content')
const hashes = require('./hashes')
const render = require('./render')
const templates = require('./templates')

function server () {
  let app = express()

  app.use(morgan('dev'))

  if (!process.env.NGINX_PORT) {
    app.use(compression())
  }

  if (process.env.CACHE_MAX_AGE !== '0') {
    app.use((req, res, next) => {
      if (req.query.h) {
        if (req.query.h === hashes[req.path]) {
          res.set('Cache-Control', `max-age=${process.env.CACHE_MAX_AGE || 31536000}`)
        }
      }
      next()
    })
  }

  if (!process.env.NGINX_PORT) {
    app.use(express.static(path.join(__dirname, '..', '..', 'dist')))
    app.use(express.static(path.join(__dirname, '..', '..', 'resources')))
  }

  app.use('/_content', content())
  app.use('/_templates', templates())
  app.use(render())

  let index = render.renderHTML(null, {
    includeScripts: true,
    includeNoscript: true
  })
  debug('index:', index)
  app.get('*', (req, res, next) => {
    res.send(index)
  })

  app.use((err, req, res, next) => {
    return res.status(err.status || 500).send(/^prod/i.test(process.env.NODE_ENV) ? '' : err.msg)
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
