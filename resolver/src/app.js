'use strict'

const express = require('express')

const { trailingSlashRedirect } = require('./utils/trailing-slash-rule')

const app = express()

app.disable('x-powered-by')

trailingSlashRedirect && app.use(trailingSlashRedirect)

app.use(require('./router'))
app.use(require('./errors/middleware'))

module.exports = app
