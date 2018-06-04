'use strict'

const promisify = require('util').promisify

const AWS = require('aws-sdk')

const debug = require('debug')('fusion:compiler:deploy')

const {
  engineCode,
  engineConfig,
  engineName
} = require('../configs')

const lambda = new AWS.Lambda()

const createFunction = promisify(lambda.createFunction.bind(lambda))
const updateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const updateFunctionConfiguration = promisify(lambda.updateFunctionConfiguration.bind(lambda))

async function create (environment, versionId, variables) {
  debug(`creating lambda for ${environment} using ${versionId}`)
  try {
    const result = await createFunction(
      Object.assign(
        {
          FunctionName: engineName(environment),
          Code: engineCode(environment, versionId),
          Publish: true
        },
        engineConfig(environment, variables)
      )
    )

    debug(`created lambda for ${environment} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error creating lambda for ${environment} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateCode (environment, versionId) {
  debug(`updating code for ${environment} using ${versionId}`)
  try {
    const result = await updateFunctionCode(
      Object.assign(
        {
          FunctionName: engineName(environment),
          Publish: true
        },
        engineCode(environment, versionId)
      )
    )

    debug(`updated code for ${environment} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error updating code for ${environment} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateConfig (environment, variables) {
  debug(`updating config for ${environment}`)
  try {
    const result = await updateFunctionConfiguration(
      Object.assign(
        {
          FunctionName: engineName(environment)
        },
        engineConfig(environment, variables)
      )
    )

    debug(`updated config for ${environment}`)
    return result
  } catch (e) {
    debug(`error updating config for ${environment}: ${e}`)
    throw e
  }
}

async function update (environment, versionId, variables) {
  await updateConfig(environment, variables)
  return updateCode(environment, versionId)
}

async function deploy (environment, versionId, variables) {
  try {
    return await create(environment, versionId, variables)
  } catch (e) {
    return update(environment, versionId, variables)
  }
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
