'use strict'

const { version } = require('../../version.json')
const awsRegion = process.env.AWS_REGION || ''

// the compiler must be accessible by version
const Key = (type) => `${type}/${process.env.VERSION || version}.zip`
const S3Bucket = process.env.S3BUCKET || `arc-fusion-discrete-${awsRegion}`

const artifact = (type) => ({
  ACL: 'private',
  Bucket: S3Bucket,
  Key: Key(type),
  ServerSideEncryption: 'AES256'
})

module.exports = {
  artifact
}
