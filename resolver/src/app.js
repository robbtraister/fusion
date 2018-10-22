'use strict'

const express = require('express')

const {
  customRenderHandler,
  failureHandler,
  redirectHandler
} = require('./errors/middleware')

const { trailingSlashRedirect } = require('./utils/trailing-slash-rule')

const app = express()

app.disable('x-powered-by')

trailingSlashRedirect && app.use(trailingSlashRedirect)

app.use(require('./router'))

app.use([
  redirectHandler,
  customRenderHandler,
  failureHandler
])

module.exports = app
