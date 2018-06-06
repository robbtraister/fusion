'use strict'

const S3Bucket = 'pagebuilder-fusion'

const bundleKey = (environment, bundleName) => `environments/${environment}/bundles/${bundleName}`

// we'll just use default S3 versioning here, because we never need to re-use these
const engineKey = (environment) => `environments/${environment}/engine.zip`

const engineArtifact = (environment) => {
  return {
    ACL: 'private',
    Bucket: S3Bucket,
    Key: engineKey(environment),
    ServerSideEncryption: 'AES256'
  }
}

module.exports = {
  bundleKey,
  engineArtifact,
  S3Bucket
}
