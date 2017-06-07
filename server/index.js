#!/usr/bin/env node

'use strict'

require('babel-core/register')

const path = require('path')

const express = require('express')
const morgan = require('morgan')
const compression = require('compression')

const content = require('./content')
const render = require('./render')

function server () {
  let app = express()

  app.use(morgan('common'))

  app.use(compression())

  app.use(render())
  app.use('/content', content())

  app.use(express.static(path.join(__dirname, '..', 'public')))

  var indexFilePath = path.join(__dirname, '..', 'public', 'index.html')
  app.get('*', (req, res, next) => {
    res.sendFile(indexFilePath)
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
