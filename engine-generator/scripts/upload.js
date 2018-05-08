'use strict'

const fs = require('fs')

const S3 = require('aws-sdk').S3
const s3 = new S3({region: 'us-east-1'})

function upload (fp) {
  const properties = require('./cfn.json').Resources.CfnLambda.Properties

  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'private',
      Body: fs.readFileSync(fp),
      Bucket: properties.Code.S3Bucket,
      Key: properties.Code.S3Key,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: 'arn:aws:kms:us-east-1:397853141546:key/72974a2e-cdd3-4fa0-8439-33e086470007'
    }, (err, data) => {
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
