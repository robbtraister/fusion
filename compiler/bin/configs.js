'use strict'

const S3Bucket = 'pagebuilder-fusion'

const { version } = require('../../version.json')

// the compiler must be accessible by version
const Key = (type) => `${type}/${process.env.VERSION || version}.zip`

const artifact = (type) => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: Key(type),
  ServerSideEncryption: 'AES256'
})

module.exports = {
  artifact
}
