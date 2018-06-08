'use strict'

const S3Bucket = 'pagebuilder-fusion'

const bundleKey = (environment, bundleName) => `environments/${environment}/bundles/${bundleName}`

// we'll just use default S3 versioning here, because we never need to re-use these
const artifactKey = (environment) => `environments/${environment}/dist.zip`

const buildArtifact = (environment) => {
  return {
    ACL: 'private',
    Bucket: S3Bucket,
    Key: artifactKey(environment),
    ServerSideEncryption: 'AES256'
  }
}

module.exports = {
  buildArtifact,
  bundleKey,
  S3Bucket
}
