'use strict'

const fs = require('fs')

const debug = require('debug')('fusion:engine-generator:upload')

const code = require('./code')

const S3 = require('aws-sdk').S3
const s3 = new S3({region: 'us-east-1'})

function upload (deployment, fp) {
  debug(`uploading ${fp} for ${deployment}`)
  const { S3Bucket, S3Key } = code(deployment)

  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'private',
      Body: fs.createReadStream(fp),
      Bucket: S3Bucket,
      Key: S3Key,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: 'arn:aws:kms:us-east-1:397853141546:key/72974a2e-cdd3-4fa0-8439-33e086470007'
    }, (err, data) => {
      debug(`uploaded: ${JSON.stringify(data)}`)
      err ? reject(err) : resolve(data)
    })
  })
}

module.exports = upload

if (module === require.main) {
  upload()
    .then(console.log)
    .catch(console.error)
}
