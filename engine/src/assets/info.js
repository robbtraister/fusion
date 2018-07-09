'use strict'

const {
  componentDistRoot,
  contextPath,
  defaultOutputType,
  environment,
  version
} = require('../../environment')

const getBucket = function getBucket () {
  return 'pagebuilder-fusion'
}

const getKeyBase = function getKeyBase () {
  return `environments/${environment}/deployments/${version}`
}

let _outputTypes
const getOutputTypes = function getOutputTypes () {
  _outputTypes = _outputTypes || Object.keys(require(`${componentDistRoot}/output-types/fusion.manifest.json`))
  return _outputTypes
}

const getRelativeUri = function getRelativeUri ({componentType, id, outputType = defaultOutputType}) {
  return `${contextPath}/dist/${componentType}/${id}.js?v=${version}&outputType=${outputType}`
}

const getS3Key = function getS3Key (name) {
  return `${getKeyBase()}/dist/${name.replace(/^\//, '')}`
}

const getS3Url = function getS3Url ({componentType, id, outputType}) {
  return `https://${getBucket()}.s3.amazonaws.com/${getS3Key({componentType, id, outputType})})`
}

module.exports = {
  getBucket,
  getKeyBase,
  getOutputTypes,
  getRelativeUri,
  getS3Key,
  getS3Url
}
