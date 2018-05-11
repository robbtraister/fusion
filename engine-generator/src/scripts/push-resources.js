'use strict'

const fs = require('fs')
const path = require('path')

const mimeTypes = require('mime-types')

const debug = require('debug')('fusion:engine-generator:push')

const promises = require('../utils/promises')

const { S3Bucket } = require('./code')()

const S3 = require('aws-sdk').S3
const s3 = new S3({region: 'us-east-1'})

async function pushFile (fp, Key) {
  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'public-read',
      Body: fs.createReadStream(fp),
      Bucket: S3Bucket,
      ContentType: mimeTypes.contentType(path.extname(fp)) || 'application/octet-stream',
      Key
    }, (err, data) => {
      debug(`uploaded: ${JSON.stringify(data)}`)
      err ? reject(err) : resolve(data)
    })
  })
}

async function pushFiles (cwd, prefix) {
  const files = await promises.glob('**/*', {cwd, nodir: true})
  return Promise.all(
    files.map(file => pushFile(path.join(cwd, file), path.join(prefix, file)))
  )
}

async function pushResources (deployment, version, srcDir) {
  return Promise.all([
    pushFiles(path.join(srcDir, 'bundle', 'resources'), `${deployment}/static/${version}/resources`),
    pushFiles(path.join(srcDir, 'dist'), `${deployment}/static/${version}/dist`)
  ])
}

module.exports = pushResources
