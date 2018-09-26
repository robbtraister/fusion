'use strict'

const debug = require('debug')('fusion:assets:io')

const S3 = require('aws-sdk').S3

const model = require('../dao')

const {
  defaultOutputType,
  environment,
  region,
  s3BucketDiscrete,
  s3BucketVersioned,
  version
} = require('../../environment')

const getKeyBase = function getKeyBase () {
  return `environments/${environment}/deployments/${version}`
}

const getS3Key = function getS3Key (name) {
  return `${getKeyBase()}/dist/${name.replace(/^\//, '')}`
}

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
      Bucket: s3BucketDiscrete,
      Key: `${getS3Key(name)}`
    }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

const pushKey = async function pushKey (Bucket, Key, src, options) {
  return new Promise((resolve, reject) => {
    debug(`pushing ${src.length} bytes to: ${Bucket}/${Key}`)

    s3.upload(
      Object.assign(
        {
          Bucket,
          Key,
          Body: src,
          ACL: 'public-read'
        },
        options || {}
      ),
      (err, data) => {
        if (err) {
          console.error(err)
        }
        err ? reject(err) : resolve(data)
      }
    )
  })
}

const pushFile = async function pushFile (name, src, ContentType) {
  return pushKey(s3BucketDiscrete, `${getS3Key(name)}`, src, {ContentType})
}

const pushResolvers = async function pushResolvers (resolvers) {
  return pushKey(s3BucketVersioned,
    `environments/${environment}/resolvers.json`,
    JSON.stringify(resolvers, null, 2),
    {
      ContentType: 'application/json',
      ACL: 'private'
    }
  )
}

module.exports = {
  fetchCssHash,
  fetchFile,
  getJson,
  pushCssHash,
  pushFile,
  pushResolvers,
  putJson
}
