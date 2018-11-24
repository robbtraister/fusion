'use strict'

const serverless = require('serverless-http')

const App = require('./src/app')
const env = require('./environment')

const { binaryContentTypes } = env

module.exports = {
  lambda: serverless(
    App(env),
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
