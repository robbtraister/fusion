'use strict'

const {
  environment,
  prefix,
  version
} = require('../environment')

const getBucket = function getBucket () {
  return 'pagebuilder-fusion'
}

const getKeyBase = function getKeyBase () {
  return `${environment}/${version}`
}

const getOutputType = function getOutputType (outputType) {
  return outputType || 'default'
}

const getRenderingName = function getRenderingName (pt) {
  return (pt.uri)
    ? `page/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}`
    : `template/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}`
}

const getRenderingUri = function getRenderingUri (pt, outputType) {
  return `${prefix}/dist/${getRenderingName(pt)}.js?v=${version}&outputType=${getOutputType(outputType)}`
}

const getRenderingUrl = function getRenderingUrl (pt, outputType) {
  return `https://${getBucket()}.s3.amazonaws.com/${getKeyBase()}/dist/${getRenderingName(pt)}/${outputType}.js`
}

module.exports = {
  getBucket,
  getKeyBase,
  getOutputType,
  getRenderingName,
  getRenderingUri,
  getRenderingUrl
}
