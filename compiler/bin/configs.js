'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../engine/package.json')

// the compiler must be accessible by version
const compilerKey = `compiler/${version}.zip`

const compilerArtifact = () => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: compilerKey,
  ServerSideEncryption: 'AES256'
})

module.exports = {
  compilerArtifact
}
