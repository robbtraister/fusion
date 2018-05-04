'use strict'

const express = require('express')

const logger = require('debug')('fusion:engine:app')

const { isDev } = require('../environment')

const { RedirectError } = require('./errors')

const app = express()

app.disable('x-powered-by')

app.use((req, res, next) => {
  logger(`${req.method} - ${req.originalUrl}`)
  next()
})

app.use(require('./router'))

app.use((err, req, res, next) => {
  if (err instanceof RedirectError) {
    res.redirect(err.statusCode, err.location)
  } else {
    next(err)
  }
})

app.use(
  (isDev)
    ? (err, req, res, next) => {
      console.error(err)
      res.status(err.statusCode || 500).send(err.message || err)
    }
    : (err, req, res, next) => {
      console.error(err)
      res.sendStatus(err.statusCode || 500)
    }
)

module.exports = app
