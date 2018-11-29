'use strict'

const express = require('express')

const {
  failureHandler,
  redirectHandler,
  renderErrorHandler
} = require('./errors/middleware')

const { trailingSlashRedirect } = require('./utils/trailing-slash-rule')

const app = express()

app.disable('x-powered-by')

trailingSlashRedirect && app.use(trailingSlashRedirect)

app.use(require('./router'))

app.use([
  redirectHandler,
  renderErrorHandler,
  failureHandler
])

module.exports = app
