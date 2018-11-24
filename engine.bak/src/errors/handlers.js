'use strict'

const { RedirectError } = require('.')

const {
  isDev
} = require('../../environment')

module.exports = [
  (err, req, res, next) => {
    if (err instanceof RedirectError) {
      return res.redirect(err.statusCode, err.location)
    }

    err.statusCode = err.statusCode || 500
    // don't log an error stack for 4xx errors
    if (err.statusCode >= 500) {
      console.error(err)
    } else if (err.message) {
      console.log(err.message)
    }

    next(err)
  },

  (isDev)
    ? (err, req, res, next) => {
      res.status(err.statusCode).send(err.message || err)
    }
    : (err, req, res, next) => {
      res.sendStatus(err.statusCode)
    }
]
