#!/usr/bin/env node

'use strict'

require('babel-core/register')

const path = require('path')

// const debug = require('debug')(`pb:server:${process.pid}`)
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')

const content = require('./content')
const hashes = require('./hashes')
const layouts = require('./layouts')
const render = require('./render')

function server () {
  let app = express()

  app.use(morgan('dev'))

  app.use(compression())

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

  app.use(express.static(path.join(__dirname, '..', '..', 'public')))
  app.use(express.static(path.join(__dirname, '..', '..', 'dist')))

  app.use('/_layouts', layouts())
  app.use('/_content', content())
  app.use(render())

  app.get('*', (req, res, next) => {
    res.sendStatus(404)
  })

  app.use((err, req, res, next) => {
    return res.status(err.status || 500).send(/^prod/i.test(process.env.NODE_ENV) ? '' : err.msg)
  })

  const port = process.env.PORT || 8080
  return app.listen(port, () => {
    console.error(`Listening on port: ${port}`)
  })
}

module.exports = server

if (module === require.main) {
  server()
}
