'use strict'

const { RedirectError } = require('.')

const {
  isDev
} = require('../../environment')

module.exports = [
  (err, req, res, next) => {
    if (err instanceof RedirectError) {
      res.redirect(err.statusCode, err.location)
    } else {
      next(err)
    }
  },

  (isDev)
    ? (err, req, res, next) => {
      console.error(err)
      res.status(err.statusCode || 500).send(err.message || err)
    }
    : (err, req, res, next) => {
      console.error(err)
      res.sendStatus(err.statusCode || 500)
    }
]
