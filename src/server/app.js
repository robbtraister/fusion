'use strict'

const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')

const { isProd } = require('../../env')

function app (options) {
  const app = express()

  app.disable('x-powered-by')

  app.use(compression())

  app.post(bodyParser.urlencoded({ extended: true }))
  app.post(bodyParser.json())

  if (isProd) {
    app.use(require('./router')(options))
    app.use(require('./errors')(options))
  } else {
    // clear require cache
    app.use((req, res, next) => {
      Object.keys(require.cache)
        .filter(mod => !/[\\/]node_modules[\\/]/.test(mod))
        .forEach(mod => {
          delete require.cache[mod]
        })
      next()
    })

    app.use((req, res, next) => {
      ;[]
        .concat(require('./router')(options) || [])
        .reverse()
        .reduce(
          (next, middleware) => () => {
            middleware(req, res, next)
          },
          next
        )()
    })

    app.use((err, req, res, next) => {
      ;[]
        .concat(require('./errors')(options) || [])
        .reverse()
        .reduce(
          (next, middleware) => () => {
            middleware(err, req, res, next)
          },
          next
        )()
    })
  }

  return app
}

module.exports = app
