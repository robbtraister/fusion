'use strict'

const serverless = require('serverless-http')

const app = require('./app')

module.exports = {
  app,
  make: require('./controllers/make'),
  resolve: require('./controllers/resolve'),
  router: require('./router'),
  serverless: serverless(app)
}
