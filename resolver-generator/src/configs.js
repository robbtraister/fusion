'use strict'

const awsRegion = process.env.AWS_REGION || ''
const awsAccountId = process.env.AWS_ACCOUNT_ID || ''
const S3Bucket = process.env.S3BUCKET || `arc-fusion-versioned-${awsRegion}`

const datadogApiKey = process.env.DATADOG_API_KEY || ''
const fusionRelease = process.env.FUSION_RELEASE

const resolverArn = async (environment, region) => `arn:aws:lambda:${region}:${awsAccountId}:function:${resolverName(environment)}`
const resolverKey = (environment) => `environments/${environment}/resolver.zip`
const resolverName = (environment) => `fusion-resolver-${environment}`
const resolverRole = async (environment) => `arn:aws:iam::${awsAccountId}:role/${resolverName(environment)}`

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
            DATADOG_API_KEY: datadogApiKey,
            FUSION_RELEASE: fusionRelease,
            AWS_ACCOUNT_ID: awsAccountId
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
  awsRegion,
  resolverArn,
  resolverArtifact,
  resolverCode,
  resolverConfig,
  resolverName
}
