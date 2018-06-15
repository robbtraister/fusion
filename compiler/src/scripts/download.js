'use strict'

const debug = require('debug')('fusion:compiler:download')

const s3 = require('../aws/s3')

const { S3Bucket } = require('../configs')
const promises = require('../utils/promises')

async function download (bundlePath) {
  const destFilePromise = promises.tempFile()
  try {
    const params = {
      Bucket: S3Bucket,
      Key: bundlePath
    }

    const destFile = await destFilePromise
    debug(`downloading ${params.Bucket} ${params.Key} to ${destFile}`)
    const data = await s3.getObject(params)
    await promises.writeFile(destFile, data.Body)
    debug(`downloaded ${params.Bucket} ${params.Key} to ${destFile}`)

    return destFile
  } catch (e) {
    promises.remove(await destFilePromise)
  }
}

module.exports = download
