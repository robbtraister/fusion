'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../engine/package.json')

// the compiler must be accessible by version
const Key = (type) => `${type}/${version}.zip`

const artifact = (type) => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: Key(type),
  ServerSideEncryption: 'AES256'
})

module.exports = {
  artifact
}
