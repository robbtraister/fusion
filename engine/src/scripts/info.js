'use strict'

const {
  environment,
  contextPath,
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

const getRelativeUri = function getRelativeUri ({componentType, id, outputType}) {
  return `${contextPath}/dist/${componentType}/${id}.js?v=${version}&outputType=${getOutputType(outputType)}`
  // return `${contextPath}/dist/${name}.js?v=${version}&outputType=${getOutputType(outputType)}${useComponentLib ? '&useComponentLib=true' : ''}`,
}

const getS3Key = function getS3Key (name) {
  return `${getKeyBase()}/dist/${name}`
}

const getS3Url = function getS3Url ({componentType, id, outputType}) {
  return `https://${getBucket()}.s3.amazonaws.com/${getS3Key({componentType, id, outputType})})`
}

module.exports = {
  getBucket,
  getKeyBase,
  getOutputType,
  getRelativeUri,
  getS3Key,
  getS3Url
}
