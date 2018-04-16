'use strict'

const express = require('express')

function server (port) {
  const app = express()

  app.disable('x-powered-by')

  app.use(require('./router'))

  app.use(
    /^dev/i.test(process.env.NODE_ENV)
      ? (err, req, res, next) => {
        console.error(err)
        res.status(err.statusCode || 500).send(err.message || err)
      }
      : (err, req, res, next) => {
        console.error(err)
        res.sendStatus(err.statusCode || 500)
      }
  )

  port = port || process.env.PORT || 8080
  return app.listen(port, (err) => {
    err ? console.error(err) : console.log(`Listening on port: ${port}`)
  })
}

module.exports = server

if (module === require.main) {
  server()
}
