'use strict'

const awsAccountId = process.env.AWS_ACCOUNT_ID
const awsRegion = process.env.AWS_REGION
const fusionRelease = process.env.VERSION
const datadogApiKey = process.env.DATADOG_API_KEY || ''
const S3Bucket = process.env.S3BUCKET || `arc-fusion-versioned-${awsRegion}`

const S3ResolverGeneratorKey = `resolver/generator.zip`

const resolverGeneratorArtifact = () => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: S3ResolverGeneratorKey,
  ServerSideEncryption: 'AES256'
})

module.exports = {
  awsAccountId,
  awsRegion,
  datadogApiKey,
  fusionRelease,
  S3Bucket,
  S3ResolverGeneratorKey,
  resolverGeneratorArtifact
}
