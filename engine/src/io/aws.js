'use strict'

const debug = require('debug')('fusion:assets:io')

const S3 = require('aws-sdk').S3

const {
  getBucket,
  getS3Key
} = require('./info')

const model = require('../dao')

const {
  defaultOutputType,
  region,
  version
} = require('../../environment')

const s3 = new S3({region})

// return the full object (not just cssFile value) because if it doesn't exist, we need to calculate it
// the calculation returns an object with a cssFile property
// for simplicity, we'll just unwrap that property from whatever we get
const fetchCssHash = (name, outputType = defaultOutputType) =>
  model('hash').get({version, id: `${name}/${outputType}`})

const pushCssHash = (name, outputType = defaultOutputType, cssFile) =>
  model('hash').put({id: `${name}/${outputType}`, version, cssFile})

const getJson = (type, id) =>
  model(type).get(id)

const putJson = (type, json) =>
  model(type).put(json)

const fetchFile = async function fetchFile (name) {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: getBucket(),
      Key: `${getS3Key(name)}`
    }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

const pushFile = async function pushFile (name, src, ContentType) {
  return new Promise((resolve, reject) => {
    const Bucket = getBucket()
    const Key = `${getS3Key(name)}`
    debug(`pushing ${src.length} bytes to: ${Bucket}/${Key}`)

    s3.upload({
      Bucket,
      Key,
      Body: src,
      ACL: 'public-read',
      ContentType,
      ContentEncoding: 'gzip'
    }, (err, data) => {
      if (err) {
        console.error(err)
      }
      err ? reject(err) : resolve(data)
    })
  })
}

module.exports = {
  fetchCssHash,
  fetchFile,
  getJson,
  pushCssHash,
  pushFile,
  putJson
}
