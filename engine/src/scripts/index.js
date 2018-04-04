'use strict'

const zlib = require('zlib')

const pack = require('../react/server/compile/pack')

const {
  findRenderableItem
} = require('../renderings')

const s3 = require('aws-promises').s3('us-east-1')

const ENVIRONMENT = process.env.ENVIRONMENT
const API_PREFIX = `/${process.env.CONTEXT || 'pb'}/api/v3`
const VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST'

const UPLOAD_SCRIPTS = !/^dev/i.test(process.env.NODE_ENV)

const getApiPrefix = function getApiPrefix () {
  return API_PREFIX
}

const getEnvironment = function getEnvironment () {
  return ENVIRONMENT
}

const getVersion = function getVersion () {
  return VERSION
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
  return new Promise((resolve, reject) => {
    zlib.gzip(src, (err, buf) => {
      err ? reject(err) : resolve(buf)
    })
  }).then((buf) => s3.upload(
    getScriptBucket(),
    key,
    buf,
    {
      ACL: 'public-read',
      ContentType: 'application/javascript',
      ContentEncoding: 'gzip'
    }
  ))
}

const compile = function compile ({pt, rendering, child, isAdmin}) {
  const {rootRenderable, upload} = (child)
    ? {
      rootRenderable: findRenderableItem(rendering)(child),
      // if this is a child feature, do not upload script
      upload: () => Promise.resolve()
    }
    : {
      rootRenderable: rendering,
      upload: (UPLOAD_SCRIPTS && pt)
        ? (src) => uploadScript(`${getScriptPrefix()}${getScriptKey(pt)}`, src)
        // if in dev mode, do not upload script
        : () => Promise.resolve()
    }

  return pack(rootRenderable, isAdmin)
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
