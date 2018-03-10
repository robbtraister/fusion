'use strict'

const express = require('express')

const app = express()

app.disable('x-powered-by')

app.use(require('./router'))

app.use(
  /^prod/i.test(process.env.NODE_ENV || '')
    ? (_, req, res, next) => { res.sendStatus(500) }
    : (err, req, res, next) => { res.status(500).send(err) }
)

module.exports = app
