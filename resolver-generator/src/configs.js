'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../resolver/package.json')

const resolverKey = (environment) => `environments/${environment}/resolver.zip`
const resolverName = (environment) => `fusion-resolver-${environment}`
const resolverRole = (environment) => `arn:aws:iam::397853141546:role/${resolverName(environment)}`

const resolverCode = (contextName) => {
  const code = {
    S3Bucket,
    S3Key: resolverKey(contextName)
  }

  return code
}

const resolverConfig = (contextName, envVars) => ({
  Environment: {
    Variables: Object.assign(
      envVars || {},
      {
        NODE_ENV: 'production'
      }
    )
  },
  Handler: 'src/index.serverless',
  MemorySize: 512,
  Role: resolverRole(contextName),
  Runtime: 'nodejs8.10',
  Timeout: 10
})

const resolverArtifact = (contextName) => {
  const {
    S3Bucket: Bucket,
    S3Key: Key
  } = resolverCode(contextName)

  return {
    ACL: 'private',
    Bucket,
    Key,
    ServerSideEncryption: 'AES256'
  }
}

module.exports = {
  resolverArtifact,
  resolverCode,
  resolverConfig,
  resolverName,
  version
}
