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
          global.awsRequestId = context.requestId || ''
        },
        response: async () => {
          await resolveMetrics()
          delete global.awsRequestId
        }
      })
    // sources: require('./content/sources')
  }
}
