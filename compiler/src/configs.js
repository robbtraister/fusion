'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../engine/package.json')

const bundleKey = (environment, bundleName) => `environments/${environment}/bundles/${bundleName}`

// we'll just use default S3 versioning here, because we never need to re-use these
const engineKey = (environment) => `engine/${environment}.zip`
const engineName = (environment) => `fusion-engine-${environment}`
const engineRole = (environment) => `arn:aws:iam::397853141546:role/${engineName(environment)}`
const engineDistPrefix = (environment, deployment) => `environments/${environment}/deployments/${deployment}/resources`
const engineResourcesPrefix = (environment, deployment) => `environments/${environment}/deployments/${deployment}/dist`

const engineCode = (environment, versionId) => {
  const code = {
    S3Bucket,
    S3Key: engineKey(environment)
  }

  if (versionId) {
    code.S3ObjectVersion = versionId
  }

  return code
}

const engineConfig = (environment, variables) => ({
  Environment: {
    Variables: Object.assign(
      variables || {},
      {
        NODE_ENV: 'production',
        FUSION_RELEASE: version
      }
    )
  },
  Handler: 'src/index.serverless',
  MemorySize: 512,
  Role: engineRole(environment),
  Runtime: 'nodejs8.10',
  Timeout: 10
})

const engineArtifact = (environment) => {
  const {
    S3Bucket: Bucket,
    S3Key: Key
  } = engineCode(environment)

  return {
    ACL: 'private',
    Bucket,
    Key,
    ServerSideEncryption: 'AES256'
  }
}

module.exports = {
  bundleKey,
  engineArtifact,
  engineCode,
  engineConfig,
  engineDistPrefix,
  engineName,
  engineResourcesPrefix,
  S3Bucket,
  version
}
