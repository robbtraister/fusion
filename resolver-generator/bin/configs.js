'use strict'

const S3Bucket = 'pagebuilder-fusion'

const S3ResolverGeneratorKey = `resolver-generator/generator.zip`

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
