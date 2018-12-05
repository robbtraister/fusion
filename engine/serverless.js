'use strict'

const serverless = require('serverless-http')

const { binaryContentTypes } = require('./environment')

const app = require('./src/app')
const { resolveMetrics } = require('./src/metrics')

module.exports = {
  lambda: serverless(
    app,
    {
      binary: binaryContentTypes,
      request: (event, context) => {
        global.awsRequestId = context.requestId || ''
      },
      response: async () => {
        await resolveMetrics()
        delete global.awsRequestId
      }
    }
  )
}
