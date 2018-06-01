'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../engine/package.json')

const bundleKey = (contextName, bundleName) => `bundles/${contextName}/${bundleName}`

// we'll just use default S3 versioning here, because we never need to re-use these
const engineKey = (contextName) => `engine/${contextName}.zip`
const engineName = (contextName) => `fusion-engine-${contextName}`
const engineRole = (contextName) => `arn:aws:iam::397853141546:role/${engineName(contextName)}`
const engineDistPrefix = (contextName, deployment) => `static/${contextName}/${deployment}/resources`
const engineResourcesPrefix = (contextName, deployment) => `static/${contextName}/${deployment}/dist`

const engineCode = (contextName, versionId) => {
  const code = {
    S3Bucket,
    S3Key: engineKey(contextName)
  }

  if (versionId) {
    code.S3ObjectVersion = versionId
  }

  return code
}

const engineConfig = (contextName, envVars) => ({
  Environment: {
    Variables: Object.assign(
      envVars || {},
      {
        NODE_ENV: 'production',
        FUSION_RELEASE: version
      }
    )
  },
  Handler: 'src/index.serverless',
  MemorySize: 512,
  Role: engineRole(contextName),
  Runtime: 'nodejs8.10',
  Timeout: 10
})

const engineArtifact = (contextName) => {
  const {
    S3Bucket: Bucket,
    S3Key: Key
  } = engineCode(contextName)

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
