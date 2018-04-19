'use strict'

const path = require('path')

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
    ? `page/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
    : `template/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
}

const getScriptUri = function getScriptUri (pt) {
  return `${getApiPrefix()}/scripts/${getScriptKey(pt)}`
}

const getScriptUrl = function getScriptUrl (pt) {
  return `https://${getScriptBucket()}.s3.amazonaws.com/${getScriptPrefix()}/${getScriptKey(pt)}`
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
  const {rootRenderable, uploadCss, uploadJs} = (child)
    ? {
      rootRenderable: findRenderableItem(rendering)(child),
      // if this is a child feature, do not upload
      uploadCss: () => Promise.resolve(),
      uploadJs: () => Promise.resolve()
    }
    : (pt && !useComponentLib)
      ? {
        rootRenderable: rendering,
        uploadCss: (name, src) => uploadScript(`${getScriptPrefix()}/${name}`, src),
        uploadJs: (name, src) => uploadScript(`${getScriptPrefix()}/${name}`, src)
      }
      : {
        rootRenderable: rendering,
        // if in dev mode, do not upload
        uploadCss: () => Promise.resolve(),
        uploadJs: () => Promise.resolve()
      }

  const parts = path.parse(getScriptKey(pt))
  const name = path.join(parts.dir, parts.name)

  return pack({name, rendering: rootRenderable, outputType, useComponentLib})
    .then(({src, css, cssFile}) => {
      return Promise.all([
        uploadCss(cssFile, css),
        uploadJs(`${name}.js`, src)
      ])
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
