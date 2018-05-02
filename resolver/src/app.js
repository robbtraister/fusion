'use strict'

const express = require('express')

const { isDev } = require('./environment')

const { trailingSlashRedirect } = require('./utils/trailing-slash-rule')

const app = express()

app.disable('x-powered-by')

trailingSlashRedirect && app.use(trailingSlashRedirect)

app.use(require('./router'))

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
