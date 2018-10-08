'use strict'

const path = require('path')

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

const EnvPrefix = `environments/${environment}`
const KeyPrefix = `${EnvPrefix}/deployments/${version}`

const s3 = new S3({ region })

const fetchKey = async (Key, Bucket = s3BucketDiscrete) =>
  new Promise((resolve, reject) => {
    Key = Key.replace(/^\//, '')
    s3.getObject({
      Bucket,
      Key
    }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })

const pushKey = async (Key, src, options, Bucket = s3BucketDiscrete) =>
  new Promise((resolve, reject) => {
    Key = Key.replace(/^\//, '')
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

const fetchAsset = async (name) =>
  fetchKey(path.join(KeyPrefix, 'dist', name))
const pushAsset = async (name, src, ContentType) =>
  pushKey(path.join(KeyPrefix, 'dist', name), src, ContentType)

// return the full object (not just cssFile value) because if it doesn't exist, we need to calculate it
// the calculation returns an object with a cssFile property
// for simplicity, we'll just unwrap that property from whatever we get
const fetchCssHash = (name, outputType = defaultOutputType) =>
  model('hash').get({ version, id: path.join(name, outputType) })
const pushCssHash = (name, outputType = defaultOutputType, cssFile) =>
  model('hash').put({ id: path.join(name, outputType), version, cssFile })

const pushHtml = async (name, src, ContentType) =>
  pushKey(path.join(EnvPrefix, 'html', name), src, ContentType)

const getJson = (type, id) =>
  model(type).get(id)
const putJson = (type, json) =>
  model(type).put(json)

const pushResolvers = async (resolvers) =>
  pushKey(
    `environments/${environment}/resolvers.json`,
    JSON.stringify(resolvers, null, 2),
    {
      ContentType: 'application/json',
      ACL: 'private'
    },
    s3BucketVersioned
  )

module.exports = {
  fetchAsset,
  fetchCssHash,
  getJson,
  pushAsset,
  pushCssHash,
  pushHtml,
  pushResolvers,
  putJson
}
