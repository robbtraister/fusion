'use strict'

const express = require('express')

const logger = require('debug')('fusion:engine:app')

const app = express()

app.disable('x-powered-by')

app.use((req, res, next) => {
  logger(`${req.method} - ${req.originalUrl}`)
  next()
})

app.use(require('./router'))

app.use(require('./errors/handlers'))

module.exports = app
