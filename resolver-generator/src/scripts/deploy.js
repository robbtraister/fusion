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
  debug(`creating resolver lambda for ${contextName}`)
  try {
    const result = await createFunction(
      Object.assign(
        {
          FunctionName: resolverName(contextName),
          Publish: true,
          Code: resolverCode(contextName)
        },
        resolverConfig(contextName, envVars)
      )
    )

    debug(`created lambda for ${contextName}`)
    return result
  } catch (e) {
    debug(`error creating lambda for ${contextName}: ${e}`)
    throw e
  }
}

async function updateCode (contextName) {
  debug(`updating code for ${contextName}`)
  try {
    const result = await updateFunctionCode(
      Object.assign(
        {
          FunctionName: resolverName(contextName),
          Publish: true
        },
        resolverCode(contextName)
      )
    )

    debug(`updated code for ${contextName}`)
    return result
  } catch (e) {
    debug(`error updating code for ${contextName}: ${e}`)
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

async function update (contextName) {
  await updateConfig(contextName)
  return updateCode(contextName)
}

async function deploy (contextName) {
  try {
    return await create(contextName)
  } catch (e) {
    return update(contextName)
  }
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
