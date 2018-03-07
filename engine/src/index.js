'use strict'

const serverless = require('serverless-http')

const app = require('./app')

module.exports = {
  app,
  filter: require('./filter'),
  render: require('./react/render'),
  router: require('./router'),
  schemas: require('./schemas'),
  serverless: serverless(app),
  sources: require('./sources')
}
