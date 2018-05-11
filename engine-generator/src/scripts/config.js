'use strict'

module.exports = (deployment) => ({
  Environment: {
    Variables: {}
  },
  Handler: 'src/index.serverless',
  KMSKeyArn: null,
  MemorySize: 512,
  Role: `arn:aws:iam::397853141546:role/fusion-engine-${deployment}`,
  Runtime: 'nodejs8.10',
  Timeout: 10
})
