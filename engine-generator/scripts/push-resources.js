'use strict'

const fs = require('fs')
const path = require('path')

const mimeTypes = require('mime-types')

const debug = require('debug')('fusion:engine-generator:push')

const promises = require('../utils/promises')

const { S3Bucket } = require('./code')()

const S3 = require('aws-sdk').S3
const s3 = new S3({region: 'us-east-1'})

function pushFiles (cwd, prefix) {
  return promises.glob('**/*', {cwd, nodir: true})
    .then(files => Promise.all(files
      .map(file => new Promise((resolve, reject) => {
        s3.upload({
          ACL: 'public-read',
          Body: fs.createReadStream(path.join(cwd, file)),
          Bucket: S3Bucket,
          ContentType: mimeTypes.contentType(path.extname(file)) || 'application/octet-stream',
          Key: path.join(prefix, file)
        }, (err, data) => {
          debug(`uploaded: ${JSON.stringify(data)}`)
          err ? reject(err) : resolve(data)
        })
      }))
    ))
}

function pushResources (deployment, version, srcDir) {
  return Promise.all([
    pushFiles(path.join(srcDir, 'bundle', 'resources'), `${deployment}/${version}/resources`),
    pushFiles(path.join(srcDir, 'dist'), `${deployment}/${version}/resources`)
  ])
}

module.exports = pushResources
