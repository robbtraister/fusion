'use strict'

const { environment, S3BucketVersioned, S3BucketDiscrete } = require('../environment')

const bundleKey = (bundleName) => `environments/${environment}/bundles/${bundleName}`

// we'll just use default S3 versioning here, because we never need to re-use these
const artifactKey = `environments/${environment}/dist.zip`

const buildArtifact = {
  ACL: 'private',
  Bucket: S3BucketVersioned,
  Key: artifactKey,
  ServerSideEncryption: 'AES256'
}

module.exports = {
  buildArtifact,
  bundleKey,
  S3BucketVersioned,
  S3BucketDiscrete
}
