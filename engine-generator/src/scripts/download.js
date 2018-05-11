'use strict'

const promisify = require('util').promisify

const debug = require('debug')('fusion:engine-generator:download')

const promises = require('../utils/promises')

const S3 = require('aws-sdk').S3
const s3 = new S3({region: 'us-east-1'})

const getObject = promisify(s3.getObject.bind(s3))

async function download (destFilePromise, Bucket, Key, VersionId) {
  const params = {
    Bucket,
    Key
  }

  if (VersionId) {
    params.VersionId = VersionId
  }

  const destFile = await destFilePromise
  debug(`downloading ${Bucket} ${Key} to ${destFile}`)
  const data = await getObject(params)
  await promises.writeFile(destFile, data.Body)
  debug(`downloaded ${Bucket} ${Key} to ${destFile}`)

  return destFile
}

module.exports = download

if (module === require.main) {
  download()
    .then(console.log)
    .catch(console.error)
}
