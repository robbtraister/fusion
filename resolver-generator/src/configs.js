'use strict'

const S3Bucket = 'pagebuilder-fusion'

const {
  getAccountId
} = require('./utils/whoami')

const fusionRelease = process.env.FUSION_RELEASE

const resolverArn = async (environment, region) => getAccountId().then((accountId) => `arn:aws:lambda:${region}:${accountId}:function:${resolverName(environment)}`)
const resolverKey = (environment) => `environments/${environment}/resolver.zip`
const resolverName = (environment) => `fusion-resolver-${environment}`
const resolverRole = async (environment) => getAccountId().then((accountId) => `arn:aws:iam::${accountId}:role/${resolverName(environment)}`)

const resolverCode = (contextName) => {
  const code = {
    S3Bucket,
    S3Key: resolverKey(contextName)
  }

  return code
}

const resolverConfig = async (contextName, envVars) => {
  return resolverRole(contextName)
    .then((Role) => ({
      Environment: {
        Variables: Object.assign(
          envVars || {},
          {
            NODE_ENV: 'production',
            ENVIRONMENT: contextName,
            FUSION_RELEASE: fusionRelease
          }
        )
      },
      Handler: 'src/index.serverless',
      MemorySize: 512,
      Role,
      Runtime: 'nodejs8.10',
      Timeout: 10
    }))
}

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
  resolverArn,
  resolverArtifact,
  resolverCode,
  resolverConfig,
  resolverName
}
