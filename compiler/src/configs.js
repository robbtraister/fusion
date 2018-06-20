'use strict'

const { environment } = require('../environment')

const S3Bucket = 'pagebuilder-fusion'

const bundleKey = (bundleName) => `environments/${environment}/bundles/${bundleName}`

// we'll just use default S3 versioning here, because we never need to re-use these
const artifactKey = `environments/${environment}/dist.zip`

const buildArtifact = {
  ACL: 'private',
  Bucket: S3Bucket,
  Key: artifactKey,
  ServerSideEncryption: 'AES256'
}

module.exports = {
  buildArtifact,
  bundleKey,
  S3Bucket
}
