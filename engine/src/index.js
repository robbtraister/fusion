'use strict'

const app = require('./app')

if (module === require.main) {
  const port = process.env.PORT || 8080
  app.listen(port, (err) => {
    err ? console.error(err) : console.log(`Listening on port: ${port}`)
  })
} else {
  const serverless = require('serverless-http')

  module.exports = {
    app,
    filter: require('./content/filter'),
    render: require('./react/server/render'),
    router: require('./router'),
    schemas: require('./content/schemas'),
    serverless: serverless(app, {binary: ['image/png', 'image/x-icon']}),
    sources: require('./content/sources')
  }
}
