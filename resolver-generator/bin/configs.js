'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../resolver/package.json')

// the resolver-generator must be accessible by version
const S3ResolverGeneratorKey = `resolver-generator/${version}.zip`

const resolverGeneratorArtifact = () => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: S3ResolverGeneratorKey,
  ServerSideEncryption: 'AES256'
})

module.exports = {
  S3Bucket,
  S3ResolverGeneratorKey,
  resolverGeneratorArtifact
}
