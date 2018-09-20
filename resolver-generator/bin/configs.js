'use strict'

const S3Bucket = process.env.S3BUCKET || 'pagebuilder-fusion'

const S3ResolverGeneratorKey = `resolver/generator.zip`

const fusionRelease = process.env.VERSION
const datadogApiKey = process.env.DATADOG_API_KEY || ''

const resolverGeneratorArtifact = () => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: S3ResolverGeneratorKey,
  ServerSideEncryption: 'AES256'
})

module.exports = {
  datadogApiKey,
  fusionRelease,
  S3Bucket,
  S3ResolverGeneratorKey,
  resolverGeneratorArtifact
}
