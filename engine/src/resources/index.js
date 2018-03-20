'use strict'

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
  return `${getApiPrefix()}/script/${getScriptKey(pt)}`
}

const getScriptUrl = function getScriptUrl (pt) {
  return `https://${getScriptBucket()}.s3.amazonaws.com/${getScriptPrefix()}${getScriptKey(pt)}`
}

const uploadScript = function upload (pt, src) {
  return s3.upload(
    getScriptBucket(),
    `${getScriptPrefix()}${getScriptKey(pt)}`,
    src,
    {
      ACL: 'public-read',
      ContentType: 'text/javascript'
    }
  )
}

module.exports = {
  getApiPrefix,
  getScriptUri,
  getScriptUrl,
  uploadScript
}
