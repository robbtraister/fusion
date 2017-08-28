'use strict'

// const debug = require('debug')(`app:index:${process.pid}`)
const logger = require('winston')

function errors () {
  // errors do not bubble up to routers, so use a simple array
  return [
    (err, req, res, next) => {
      res.status(500).send(/^prod/i.test(process.env.NODE_ENV) ? '' : err)
      logger.error(err)
    },
    (req, res, next) => {
      res.sendStatus(404)
    }
  ]
}

module.exports = errors
