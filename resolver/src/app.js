'use strict'

const express = require('express')

const { isDev } = require('../environment')
const isWhy404 = require('./utils/is-why-404')

const { NotFoundError, RedirectError } = require('./errors')

const { trailingSlashRedirect } = require('./utils/trailing-slash-rule')

const app = express()

app.disable('x-powered-by')

trailingSlashRedirect && app.use(trailingSlashRedirect)

app.use(require('./router'))

app.use((err, req, res, next) => {
  if (err instanceof RedirectError) {
    res.redirect(err.statusCode, err.location)
  } else if (err instanceof NotFoundError && isWhy404(req)) {
    res.status(404).json(err)
  } else {
    next(err)
  }
})

app.use(
  (isDev)
    ? (err, req, res, next) => {
      !err.isEngine && console.error(err)
      res.status(err.statusCode || 500).send(err.message || err)
    }
    : (err, req, res, next) => {
      !err.isEngine && console.error(err)
      res.sendStatus(err.statusCode || 500)
    }
)

module.exports = app
