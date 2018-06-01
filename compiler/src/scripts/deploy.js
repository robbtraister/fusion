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

async function create (contextName, versionId) {
  debug(`creating lambda for ${contextName} using ${versionId}`)
  try {
    const result = await createFunction(
      Object.assign(
        {
          FunctionName: engineName(contextName),
          Code: engineCode(contextName, versionId),
          Publish: true
        },
        engineConfig(contextName)
      )
    )

    debug(`created lambda for ${contextName} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error creating lambda for ${contextName} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateCode (contextName, versionId) {
  debug(`updating code for ${contextName} using ${versionId}`)
  try {
    const result = await updateFunctionCode(
      Object.assign(
        {
          FunctionName: engineName(contextName),
          Publish: true
        },
        engineCode(contextName, versionId)
      )
    )

    debug(`updated code for ${contextName} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error updating code for ${contextName} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateConfig (contextName) {
  debug(`updating config for ${contextName}`)
  try {
    const result = await updateFunctionConfiguration(
      Object.assign(
        {
          FunctionName: engineName(contextName)
        },
        engineConfig(contextName)
      )
    )

    debug(`updated config for ${contextName}`)
    return result
  } catch (e) {
    debug(`error updating config for ${contextName}: ${e}`)
    throw e
  }
}

async function update (contextName, versionId) {
  await updateConfig(contextName)
  return updateCode(contextName, versionId)
}

async function deploy (contextName, versionId) {
  try {
    return await create(contextName, versionId)
  } catch (e) {
    return update(contextName, versionId)
  }
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
