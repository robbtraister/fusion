'use strict'

const promisify = require('util').promisify

const AWS = require('aws-sdk')

const debug = require('debug')('fusion:resolver-generator:deploy')

const {
  resolverArn,
  resolverCode,
  resolverConfig,
  resolverName
} = require('../configs')

const lambda = new AWS.Lambda()

const createAlias = promisify(lambda.createAlias.bind(lambda))
const createFunction = promisify(lambda.createFunction.bind(lambda))
const tagResource = promisify(lambda.tagResource.bind(lambda))
const updateAlias = promisify(lambda.updateAlias.bind(lambda))
const updateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const updateFunctionConfiguration = promisify(lambda.updateFunctionConfiguration.bind(lambda))

function getTags (contextName) {
  return {
    'fusion-stage': 'resolver',
    'environment': contextName
  }
}

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
        { Tags: getTags(contextName) },
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

async function promote (contextName, FunctionVersion) {
  try {
    return await createAlias({
      FunctionName: resolverName(contextName),
      FunctionVersion,
      Name: 'live'
    })
  } catch (e) {
    return updateAlias({
      FunctionName: resolverName(contextName),
      FunctionVersion,
      Name: 'live'
    })
  }
}

async function tag (contextName, region) {
  debug(`tagging lambda for ${contextName}`)
  try {
    const result = await tagResource(
      {
        Resource: resolverArn(contextName, region),
        Tags: getTags(contextName)
      }
    )

    debug(`tagged lambda for ${contextName}`)
    return result
  } catch (e) {
    debug(`error tagging lambda for ${contextName}: ${e}`)
    // don't error on tagging
    // throw e
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

async function update (contextName, region) {
  await Promise.all([
    updateConfig(contextName),
    tag(contextName, region)
  ])
  return updateCode(contextName)
}

async function deploy (contextName, region) {
  try {
    return await create(contextName)
  } catch (e) {
    return update(contextName, region)
  }
}

module.exports = async function (contextName, region) {
  const result = await deploy(contextName, region)

  await promote(contextName, result.Version)

  return result
}

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
