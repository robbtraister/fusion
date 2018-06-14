'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../resolver/package.json')

// the resolver-generator must be accessible by version
const resolverGeneratorKey = `resolverGenerator/${version}.zip`

const resolverGeneratorArtifact = () => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: resolverGeneratorKey,
  ServerSideEncryption: 'AES256'
})

module.exports = {
  resolverGeneratorArtifact
}
