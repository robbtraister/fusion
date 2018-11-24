'use strict'

const { RedirectError } = require('.')

// error handlers don't work in express Routers, so just use an array of functions
module.exports = (env) => {
  const { isDev } = env || {}

  return [
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
        const statusCode = err.statusCode || 500

        // don't log an error stack for 4xx errors
        if (statusCode >= 500) {
          console.error(err)
        } else if (err.message) {
          console.log(err.message)
        }

        res.sendStatus(err.statusCode || 500)
      }
  ]
}
