'use strict'

const {
  componentDistRoot,
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

const getS3Key = function getS3Key (name) {
  return `${getKeyBase()}/dist/${name.replace(/^\//, '')}`
}

module.exports = {
  getBucket,
  getKeyBase,
  getOutputTypes,
  getS3Key
}
