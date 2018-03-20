'use strict'

const zlib = require('zlib')

const pack = require('../react/server/compile/pack')

const {
  findRenderableItem
} = require('../renderings')

const s3 = require('aws-promises').s3('us-east-1')

const STAGE = 'staging' // process.env.STAGE
const API_PREFIX = `/${process.env.CONTEXT || 'pb'}/api/v3`

const getApiPrefix = function getApiPrefix () {
  return API_PREFIX
}

const getStage = function getStage () {
  return STAGE
}

const getScriptBucket = function getScriptBucket () {
  return 'pagebuilder-fusion'
}

const getScriptPrefix = function getScriptPrefix () {
  return `${getStage()}/resources/`
}

const getScriptKey = function getScriptKey (pt) {
  return (pt.uri)
    ? `pages/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
    : `templates/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
}

const getScriptUri = function getScriptUri (pt) {
  return `${getApiPrefix()}/scripts/${getScriptKey(pt)}`
}

const getScriptUrl = function getScriptUrl (pt) {
  return `https://${getScriptBucket()}.s3.amazonaws.com/${getScriptPrefix()}${getScriptKey(pt)}`
}

const uploadScript = function upload (pt, src) {
  return new Promise((resolve, reject) => {
    zlib.gzip(src, (err, buf) => {
      err ? reject(err) : resolve(buf)
    })
  }).then((buf) => s3.upload(
    getScriptBucket(),
    `${getScriptPrefix()}${getScriptKey(pt)}`,
    buf,
    {
      ACL: 'public-read',
      ContentType: 'text/javascript',
      ContentEncoding: 'gzip'
    }
  ))
}

const compile = function compile (pt, rendering, child) {
  const {rootRenderable, upload} = (child)
    ? {
      rootRenderable: findRenderableItem(rendering)(child),
      upload: () => null
    }
    : {
      rootRenderable: rendering,
      upload: (pt)
        ? (src) => uploadScript(pt, src)
        : () => null
    }

  return pack(rootRenderable)
    .then(src => {
      return upload(src)
        .then(() => src)
    })
}

module.exports = {
  compile,
  getApiPrefix,
  getScriptUri,
  getScriptUrl,
  uploadScript
}
