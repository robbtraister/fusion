'use strict'

require('../mock-requires/server')

const {
  binaryContentTypes,
  port
} = require('../environment')

const {
  resolveMetrics
} = require('./utils/send-metrics')

const app = require('./app')

if (module === require.main) {
  app.listen(port, (err) => {
    err ? console.error(err) : console.log(`Listening on port: ${port}`)
  })
} else {
  console.log('not listening on port')
  const serverless = require('serverless-http')

  module.exports = {
    app,
    // filter: require('./content/filter'),
    // render: require('./react/server/render'),
    router: require('./router'),
    // schemas: require('./content/schemas'),

    serverless: serverless(app,
      {
        binary: binaryContentTypes,
        request: (event, context) => {
          // make the request ID available globally for the request lifecycle (i.e. send-metrics)
          global.awsRequestId = context.requestId || 'undefined'
        },
        response: async () => {
          await resolveMetrics()
          // delete the request ID from the global scope to complete request lifecycle
          delete global.awsRequestId
        }
      })
    // sources: require('./content/sources')
  }
}
