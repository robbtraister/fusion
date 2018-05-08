'use strict'

const debug = require('debug')('fusion:engine-generator:download')

const promisify = require('../utils/promisify')
const promises = require('../utils/promises')

const S3 = require('aws-sdk').S3
const s3 = new S3({region: 'us-east-1'})

const getObject = promisify(s3.getObject.bind(s3))

function download (Bucket, Key, VersionId) {
  const params = {
    Bucket,
    Key
  }

  if (VersionId) {
    params.VersionId = VersionId
  }

  return promises.tempFile()
    .then(tf => {
      debug(`downloading ${Bucket} ${Key} to ${tf}`)
      return getObject(params)
        .then(data => promises.writeFile(tf, data.Body))
        .then(() => debug(`downloaded ${Bucket} ${Key} to ${tf}`))
        .then(() => tf)
    })
}

module.exports = download

if (module === require.main) {
  download()
    .then(console.log)
    .catch(console.error)
}
