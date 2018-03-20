'use strict'

const s3 = require('aws-promises').s3('us-east-1')

const STAGE = 'staging' // process.env.STAGE

const getStage = function getStage () {
  return STAGE
}

const getScriptBucket = function getScriptBucket () {
  return 'pagebuilder-fusion'
}

const getScriptKey = function getScriptKey (pt) {
  const prefix = `${getStage()}/resources/`

  const key = (pt.uri)
    ? `pages/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
    : `templates/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}.js`

  return prefix + key
}

const getScriptUrl = function getScriptUrl (pt) {
  return `https://${getScriptBucket()}.s3.amazonaws.com/${getScriptKey(pt)}`
}

const uploadScript = function upload (pt, src) {
  return s3.upload(
    getScriptBucket(),
    getScriptKey(pt),
    src,
    {
      ACL: 'public-read',
      ContentType: 'text/javascript'
    }
  )
}

module.exports = {
  getScriptBucket,
  getScriptKey,
  getScriptUrl,
  uploadScript
}
