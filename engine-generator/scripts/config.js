'use strict'

module.exports = () => ({
  Environment: {
    Variables: {}
  },
  Handler: 'src/index.serverless',
  KMSKeyArn: null,
  MemorySize: 512,
  Publish: true,
  Role: 'arn:aws:iam::397853141546:role/fusion-engine-staging-us-east-1-lambdaRole',
  Runtime: 'nodejs8.10',
  Timeout: 10
})
