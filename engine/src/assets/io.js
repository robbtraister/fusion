'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const debug = require('debug')('fusion:assets:io')

const S3 = require('aws-sdk').S3

const {
  getBucket,
  getS3Key
} = require('./info')

const {
  bundleDistRoot,
  isDev,
  region
} = require('../../environment')

const s3 = new S3({region})

const fetchFromFS = async function (name) {
  const fp = path.resolve(bundleDistRoot, name)
  return new Promise((resolve, reject) => {
    fs.readFile(fp, (err, data) => {
      err ? reject(err) : resolve(data.toString())
    })
  })
}

const fetchFromS3 = async function fetchFromS3 (name) {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: getBucket(),
      Key: `${getS3Key(name)}`
    }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .then((src) => new Promise((resolve, reject) => {
      zlib.gunzip(src, (err, buf) => {
        err ? reject(err) : resolve(buf.toString())
      })
    }))
}

const pushToFS = async function pushToFS (name, src) {
  const filePath = path.resolve(`${bundleDistRoot}/${name}`)
  return new Promise((resolve, reject) => {
    childProcess.exec(`mkdir -p ${path.dirname(filePath)}`, (err) => {
      err ? reject(err) : resolve()
    })
  })
    .then(() => new Promise((resolve, reject) => {
      fs.writeFile(filePath, src, (err) => {
        err ? reject(err) : resolve()
      })
    }))
}

const pushToS3 = async function pushToS3 (name, src, ContentType) {
  return new Promise((resolve, reject) => {
    zlib.gzip(src, (err, buf) => {
      err ? reject(err) : resolve(buf)
    })
  })
    .then((buf) => new Promise((resolve, reject) => {
      const Bucket = getBucket()
      const Key = `${getS3Key(name)}`
      debug(`pushing ${buf.length} bytes to: ${Bucket}/${Key}`)

      s3.upload({
        Bucket,
        Key,
        Body: buf,
        ACL: 'public-read',
        ContentType,
        ContentEncoding: 'gzip'
      }, (err, data) => {
        if (err) {
          console.error(err)
        }
        err ? reject(err) : resolve(data)
      })
    }))
}

module.exports = {
  fetchFile: (isDev) ? fetchFromFS : fetchFromS3,
  pushFile: (isDev) ? pushToFS : pushToS3
}
