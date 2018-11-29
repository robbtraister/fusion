'use strict'

const { RedirectError } = require('.')

const { isDev } = require('../../environment')

const redirectHandler = function redirectHandler (err, req, res, next) {
  if (err instanceof RedirectError) {
    res.redirect(err.statusCode, err.location)
  } else {
    next(err)
  }
}

const errorHandler = (isDev)
  ? function errorHandler (err, req, res, next) {
    console.error(err)
    res.status(err.statusCode || 500).send(err.message || err)
  }
  : function errorHandler (err, req, res, next) {
    const statusCode = err.statusCode || 500

    // don't log an error stack for 4xx errors
    if (statusCode >= 500) {
      console.error(err)
    } else if (err.message) {
      console.log(err.message)
    }

    res.sendStatus(err.statusCode || 500)
  }

// error handlers don't work in express Routers, so just use an array of functions
module.exports = [
  redirectHandler,
  errorHandler
]
