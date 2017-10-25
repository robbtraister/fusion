#!/usr/bin/env node

'use strict'

const path = require('path')

// const debug = require('debug')(`app:index:${process.pid}`)
const express = require('express')
const logger = require('winston')
const morgan = require('morgan')

const js = require('./engines/js')
const hbs = require('./engines/hbs')
const jsx = require('./engines/jsx')

const router = options => {
  if (!/^prod/i.test(process.env.NODE_ENV) && process.env.WATCH === 'true') {
    require('shell-watcher')({
      targets: [
        path.resolve(__dirname),
        path.resolve(`${__dirname}/../dist/resolvers`)
      ]
    })

    return (req, res, next) => {
      require('./router')(options)(req, res, next)
    }
  } else {
    return require('./router')(options)
  }
}

function server (port) {
  const app = express()

  app.enable('trust proxy')
  app.disable('x-powered-by')

  // Enable templating engines
  app.engine('.js', js({extname: '.js'}))
  app.engine('.hbs', hbs({extname: '.hbs', layoutsDir: `${__dirname}/../dist/layouts`, defaultLayout: 'html'}))
  app.engine('.jsx', jsx({extname: '.jsx', layoutsDir: `${__dirname}/../dist/layouts`, defaultLayout: 'html'}))
  app.set('view engine', '.hbs')
  app.set('views', `${__dirname}/../dist/templates`)

  if (!/^prod/i.test(process.env.NODE_ENV)) {
    app.use(morgan('dev', {
      stream: {
        write: log => logger.info(log.replace(/\s+$/, ''))
      }
    }))
  }

  // app.use(require('compression')())

  app.use(router())

  app.use((err, req, res, next) => {
    res.status(500).send(/^prod/i.test(process.env.NODE_ENV) ? '' : err)
    logger.error(err)
  })

  app.use((req, res, next) => {
    res.sendStatus(404)
  })

  port = port || process.env.PORT || 8080
  return app.listen(port, err => {
    if (err) {
      logger.error(err)
    } else {
      logger.info(`Listening on port: ${port}`)
    }
  })
}

module.exports = server

if (module === require.main) {
  server()
}
