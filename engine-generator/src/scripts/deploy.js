'use strict'

const AWS = require('aws-sdk')

const debug = require('debug')('fusion:engine-generator:deploy')

const lambda = new AWS.Lambda()

const code = require('./code')
const config = require('./config')

const getFunctionName = (deployment) => `fusion-engine-${deployment}`

function create (deployment, versionId) {
  debug(`creating lambda for ${deployment} using ${versionId}`)
  return new Promise((resolve, reject) => {
    lambda.createFunction(Object.assign(
      { FunctionName: getFunctionName(deployment) },
      config(),
      { Code: code(deployment, versionId) }
    ), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .then((result) => {
      debug(`created lambda for ${deployment} using ${versionId}`)
      return result
    })
    .catch((err) => {
      debug(`error creating lambda for ${deployment} using ${versionId}: ${err}`)
      throw err
    })
}

function updateCode (deployment, versionId) {
  debug(`updating code for ${deployment} using ${versionId}`)
  return new Promise((resolve, reject) => {
    lambda.updateFunctionCode(Object.assign(
      {
        FunctionName: getFunctionName(deployment),
        Publish: true
      },
      code(deployment, versionId)
    ), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .then((result) => {
      debug(`updated code for ${deployment} using ${versionId}`)
      return result
    })
    .catch((err) => {
      debug(`error updating code for ${deployment} using ${versionId}: ${err}`)
      throw err
    })
}

function updateConfig (deployment) {
  debug(`updating config for ${deployment}`)
  return new Promise((resolve, reject) => {
    lambda.updateFunctionConfiguration(Object.assign(
      { FunctionName: getFunctionName(deployment) },
      config()
    ), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .then((result) => {
      debug(`updated config for ${deployment}`)
      return result
    })
    .catch((err) => {
      debug(`error updating config for ${deployment}: ${err}`)
      throw err
    })
}

function update (deployment, versionId) {
  return updateConfig(deployment)
    .then(() => updateCode(deployment, versionId))
}

function deploy (deployment, versionId) {
  return create(deployment, versionId)
    .catch(() => update(deployment, versionId))
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
