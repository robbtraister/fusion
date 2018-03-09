'use strict'

const serverless = require('serverless-http')

const app = require('./app')

module.exports = {
  app,
  filter: require('./content/filter'),
  render: require('./react/render'),
  router: require('./router'),
  schemas: require('./content/schemas'),
  serverless: serverless(app),
  sources: require('./content/sources')
}
