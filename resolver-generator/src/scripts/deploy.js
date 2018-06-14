'use strict'

const promisify = require('util').promisify

const AWS = require('aws-sdk')

const debug = require('debug')('fusion:resolver-generator:deploy')

const {
  resolverCode,
  resolverConfig,
  resolverName
} = require('../configs')

const lambda = new AWS.Lambda()

const createFunction = promisify(lambda.createFunction.bind(lambda))
const updateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const updateFunctionConfiguration = promisify(lambda.updateFunctionConfiguration.bind(lambda))

async function create (contextName, envVars) {
  debug(`Redeploying resolver lambda for ${contextName}`)
  try {
    const result = await createFunction(
      Object.assign(
        {
          FunctionName: resolverName(contextName),
          Code: resolverCode(contextName, versionId),
          Publish: true
        },
        resolverConfig(contextName, envVars)
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
          FunctionName: resolverName(contextName),
          Publish: true
        },
        resolverCode(contextName, versionId)
      )
    )

    debug(`updated code for ${contextName} using ${versionId}`)
    return result
  } catch (e) {
    debug(`error updating code for ${contextName} using ${versionId}: ${e}`)
    throw e
  }
}

async function updateConfig (contextName, envVars) {
  debug(`updating config for ${contextName}`)
  try {
    const result = await updateFunctionConfiguration(
      Object.assign(
        {
          FunctionName: resolverName(contextName)
        },
        resolverConfig(contextName, envVars)
      )
    )

    debug(`updated config for ${contextName}`)
    return result
  } catch (e) {
    debug(`error updating config for ${contextName}: ${e}`)
    throw e
  }
}

async function update (contextName, versionId, envVars) {
  await updateConfig(contextName, envVars)
  return updateCode(contextName, versionId)
}

async function deploy (contextName, versionId, envVars) {
  try {
    return await create(contextName, versionId, envVars)
  } catch (e) {
    return update(contextName, versionId, envVars)
  }
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
