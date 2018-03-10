'use strict'

const serverless = require('serverless-http')

const app = require('./app')

module.exports = {
  app,
  resolve: require('./resolve'),
  router: require('./router'),
  serverless: serverless(app)
}
