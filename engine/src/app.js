'use strict'

const express = require('express')

const app = express()

app.disable('x-powered-by')

app.use(require('./router'))

app.use(
  /^prod/i.test(process.env.NODE_ENV || '')
    ? (err, req, res, next) => {
      console.error(err)
      res.sendStatus(err.statusCode || 500)
    }
    : (err, req, res, next) => {
      console.error(err)
      res.status(err.statusCode || 500).send(err.message || err)
    }
)

module.exports = app
