'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../engine/package.json')

const engineName = (contextName) => `fusion-engine-${contextName}`

const engineCode = (contextName, versionId) => {
  const code = {
    S3Bucket,
    // we'll just use default S3 versioning here, because we never need to re-use these
    S3Key: `engine/${contextName}.zip`
  }

  if (versionId) {
    code.S3ObjectVersion = versionId
  }

  return code
}

const engineConfig = (contextName) => ({
  Environment: {
    Variables: {
      NODE_ENV: 'production',
      CONTENT_BASE: '',
      FUSION_RELEASE: version
    }
  },
  Handler: 'src/index.serverless',
  MemorySize: 512,
  Role: `arn:aws:iam::397853141546:role/${engineName(contextName)}`,
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

const engineDistPrefix = (contextName, deployment) => `static/${contextName}/${deployment}/resources`
const engineResourcesPrefix = (contextName, deployment) => `static/${contextName}/${deployment}/dist`

module.exports = {
  engineArtifact,
  engineCode,
  engineConfig,
  engineDistPrefix,
  engineName,
  engineResourcesPrefix,
  S3Bucket,
  version
}
