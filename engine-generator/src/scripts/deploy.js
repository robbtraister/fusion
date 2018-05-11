'use strict'

const promisify = require('util').promisify

const AWS = require('aws-sdk')

const debug = require('debug')('fusion:engine-generator:deploy')

const code = require('./code')
const config = require('./config')

const getFunctionName = (deployment) => `fusion-engine-${deployment}`

const lambda = new AWS.Lambda()

const createFunction = promisify(lambda.createFunction.bind(lambda))
const updateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const updateFunctionConfiguration = promisify(lambda.updateFunctionConfiguration.bind(lambda))

async function create (deployment, versionId) {
  debug(`creating lambda for ${deployment} using ${versionId}`)
  try {
    const result = await createFunction(
      Object.assign(
        {
          FunctionName: getFunctionName(deployment),
          Code: code(deployment, versionId),
          Publish: true
        },
        config(deployment)
      )
    )

    debug(`created lambda for ${deployment} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error creating lambda for ${deployment} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateCode (deployment, versionId) {
  debug(`updating code for ${deployment} using ${versionId}`)
  try {
    const result = await updateFunctionCode(
      Object.assign(
        {
          FunctionName: getFunctionName(deployment),
          Publish: true
        },
        code(deployment, versionId)
      )
    )

    debug(`updated code for ${deployment} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error updating code for ${deployment} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateConfig (deployment) {
  debug(`updating config for ${deployment}`)
  try {
    const result = await updateFunctionConfiguration(
      Object.assign(
        {
          FunctionName: getFunctionName(deployment)
        },
        config(deployment)
      )
    )

    debug(`updated config for ${deployment}`)
    return result
  } catch (e) {
    debug(`error updating config for ${deployment}: ${e}`)
    throw e
  }
}

async function update (deployment, versionId) {
  await updateConfig(deployment)
  return updateCode(deployment, versionId)
}

async function deploy (deployment, versionId) {
  try {
    return await create(deployment, versionId)
  } catch (e) {
    return update(deployment, versionId)
  }
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
