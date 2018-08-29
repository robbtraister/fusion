'use strict'

const {
  environment,
  version
} = require('../../environment')

const getBucket = function getBucket () {
  return 'pagebuilder-fusion'
}

const getKeyBase = function getKeyBase () {
  return `environments/${environment}/deployments/${version}`
}

const getS3Key = function getS3Key (name) {
  return `${getKeyBase()}/dist/${name.replace(/^\//, '')}`
}

module.exports = {
  getBucket,
  getKeyBase,
  getS3Key
}
