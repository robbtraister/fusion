'use strict'

const serverless = require('serverless-http')

const app = require('./src/app')
const { binaryContentTypes } = require('./environment')

module.exports = {
  lambda: serverless(
    app,
    {
      binary: binaryContentTypes
      // request: (event, context) => {
      //   global.awsRequestId = context.requestId || ''
      // },
      // response: async () => {
      //   await resolveMetrics()
      //   delete global.awsRequestId
      // }
    }
  )
}
