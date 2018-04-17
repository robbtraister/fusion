'use strict'

const S3 = require('aws-sdk').S3
const zlib = require('zlib')

const pack = require('../react/server/compile/pack')

const {
  findRenderableItem
} = require('../models/renderings')

const s3 = new S3({region: 'us-east-1'})

const {
  apiPrefix,
  environment,
  isDev,
  version
} = require('../environment')

const UPLOAD_SCRIPTS = !isDev

const getApiPrefix = function getApiPrefix () {
  return apiPrefix
}

const getEnvironment = function getEnvironment () {
  return environment
}

const getVersion = function getVersion () {
  return version
}

const getScriptBucket = function getScriptBucket () {
  return 'pagebuilder-fusion'
}

const getScriptPrefix = function getScriptPrefix () {
  return `${getEnvironment()}/${getVersion()}/scripts`
}

const getScriptKey = function getScriptKey (pt) {
  return (pt.uri)
    ? `/page/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
    : `/template/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
}

const getScriptUri = function getScriptUri (pt) {
  return `${getApiPrefix()}/scripts${getScriptKey(pt)}`
}

const getScriptUrl = function getScriptUrl (pt) {
  return `https://${getScriptBucket()}.s3.amazonaws.com/${getScriptPrefix()}${getScriptKey(pt)}`
}

const uploadScript = function uploadScript (key, src) {
  return (UPLOAD_SCRIPTS)
    ? new Promise((resolve, reject) => {
      zlib.gzip(src, (err, buf) => {
        err ? reject(err) : resolve(buf)
      })
    }).then((buf) => new Promise((resolve, reject) => {
      s3.upload({
        Bucket: getScriptBucket(),
        Key: key,
        Body: buf,
        ACL: 'public-read',
        ContentType: 'application/javascript',
        ContentEncoding: 'gzip'
      }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    }))
    : Promise.resolve()
}

const compile = function compile ({pt, rendering, outputType, child, useComponentLib}) {
  const {rootRenderable, upload} = (child)
    ? {
      rootRenderable: findRenderableItem(rendering)(child),
      // if this is a child feature, do not upload script
      upload: () => Promise.resolve()
    }
    : {
      rootRenderable: rendering,
      upload: (pt && !useComponentLib)
        ? (src) => uploadScript(`${getScriptPrefix()}${getScriptKey(pt)}`, src)
        // if in dev mode, do not upload script
        : () => Promise.resolve()
    }

  return pack(rootRenderable, outputType, useComponentLib)
    .then(src => {
      return upload(src)
        .then(() => src)
    })
}

module.exports = {
  compile,
  getApiPrefix,
  getScriptPrefix,
  getScriptUri,
  getScriptUrl,
  getVersion,
  uploadScript
}
