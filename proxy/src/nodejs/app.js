'use strict'

const express = require('express')

function server (port) {
  const app = express()

  app.disable('x-powered-by')

  app.use(require('./router'))

  app.use(
    /^prod/i.test(process.env.NODE_ENV || '')
      ? (_, req, res, next) => { res.sendStatus(500) }
      : (err, req, res, next) => { res.status(500).send(err) }
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
