'use strict'

const { isDev } = require('../../environment')
const isWhy404 = require('../utils/is-why-404')

const make = require('../controllers/make')
const { makeOptions } = require('../router/make')

const { NotFoundError, RedirectError } = require('.')

const redirectHandler = function redirectHandler (err, req, res, next) {
  if (err instanceof RedirectError) {
    res.redirect(err.statusCode, err.location)
  } else if (err instanceof NotFoundError && isWhy404(req)) {
    res.status(404).json(err)
  } else {
    next(err)
  }
}

const renderErrorHandler = async function renderErrorHandler (err, req, res, next) {
  if (err && err.statusCode) {
    try {
      const response = await make(
        `/error/${err.statusCode}`,
        Object.assign(
          makeOptions(req),
          { pagesOnly: true }
        )
      )
      if (response) {
        res.set(response.headers || {})
        res.send(response.body)
        return
      }
    } catch (e) {}
  }
  next(err)
}

const failureHandler = (isDev)
  ? function failureHandler (err, req, res, next) {
    !err.isEngine && console.error(err)
    res.status(err.statusCode || 500)
    if (err.body) {
      res.set(err.headers || {})
      res.send(err.body)
    } else {
      res.send(err.message || err)
    }
  }
  : function failureHandler (err, req, res, next) {
    !err.isEngine && console.error(err)
    res.sendStatus(err.statusCode || 500)
  }

module.exports = [
  redirectHandler,
  renderErrorHandler,
  failureHandler
]
