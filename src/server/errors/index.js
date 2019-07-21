'use strict'

const { isProd } = require('../../../env')

const failHandler = isProd
  ? function failHandler (err, req, res, next) {
      res.sendStatus(500)
    }
  : function failHandler (err, req, res, next) {
      res.status(500).send(err.message || err.body || err)
    }

function logHandler (err, req, res, next) {
  console.error(err)
  next()
}

module.exports = options => [logHandler, failHandler]
