'use strict'

const path = require('path')

const debug = require('debug')('fusion:assets:io')

const S3 = require('aws-sdk').S3

const { getModel } = require('./dao')

const {
  deployment,
  environment,
  region,
  s3BucketDiscrete,
  s3BucketVersioned
} = require('../../../environment')

const deploymentValue = deployment.value

const EnvPrefix = `environments/${environment}`
const DeploymentPrefix = `${EnvPrefix}/deployments/${deploymentValue}`

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

const putKey = async (Key, src, options, Bucket = s3BucketDiscrete) =>
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
  fetchKey(path.join(DeploymentPrefix, 'dist', name))
const putAsset = async (name, src, ContentType) =>
  putKey(path.join(DeploymentPrefix, 'dist', name), src, { ContentType })

async function fetchTemplateHash (id) {
  const record = await getModel('hash').get({ version: deploymentValue, id })
  if (record) {
    return record.hash
  }
}

module.exports = {
  ...require('../_shared'),

  fetchTemplateHash,

  async fetchTemplateStyles (id) {
    const hash = await fetchTemplateHash(id)
    return fetchAsset(path.join('styles', `${hash}.css`))
  },

  async getRendering ({ type, id }) {
    return getModel(type).get(id)
  },

  async putCompilation (id, { hash, script, styles }) {
    return Promise.all([
      putAsset(path.join('styles', `${hash}.css`), styles, 'application/javascript'),
      putAsset(`${id}.js`, script, 'text/css'),
      getModel('hash').put({ id, version: deploymentValue, hash })
    ])
  },

  async putRender (name, src, ContentType) {
    return putKey(path.join(EnvPrefix, 'html', name), src, { ContentType })
  },

  async putRendering ({ type, json }) {
    return getModel(type).put(json)
  },

  async putResolvers (resolvers) {
    return putKey(
      `${EnvPrefix}/resolvers.json`,
      JSON.stringify(resolvers, null, 2),
      {
        ContentType: 'application/json',
        ACL: 'private'
      },
      s3BucketVersioned
    )
  }
}
