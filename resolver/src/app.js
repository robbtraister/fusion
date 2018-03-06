'use strict'

const express = require('express')
const serverless = require('serverless-http')

const resolve = require('./resolve')

const app = express()

const router = express.Router()

router.get('*', (req, res, next) => {
  resolve(req.originalUrl)
    .then(data => res.send(data))
    .catch(next)
})

app.use(router)

module.exports = {
  app,
  router,
  serverless: serverless(app)
}
