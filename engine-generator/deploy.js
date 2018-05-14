'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:engine-generator')

const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
const s3 = new AWS.S3({region: 'us-east-1'})

const FunctionName = `fusion-generator-engine`

const awsCreateFunction = promisify(lambda.createFunction.bind(lambda))
const awsUpdateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const awsUpdateFunctionConfiguration = promisify(lambda.updateFunctionConfiguration.bind(lambda))
const awsUpload = promisify(s3.upload.bind(s3))
const awsCreateAlias = promisify(lambda.createAlias.bind(lambda))
const awsUpdateAlias = promisify(lambda.updateAlias.bind(lambda))

const code = (S3ObjectVersion) => ({
  S3Bucket: 'pagebuilder-fusion',
  S3Key: `engine-generator.zip`,
  S3ObjectVersion
})

const config = () => ({
  Environment: {
    Variables: {
      DEBUG: 'fusion:*'
    }
  },
  Handler: 'engine-generator/src/index.handler',
  KMSKeyArn: null,
  MemorySize: 1024,
  Role: 'arn:aws:iam::397853141546:role/fusion-generator',
  Runtime: 'nodejs8.10',
  Timeout: 300
})

async function upload (fp) {
  debug(`uploading ${fp}`)

  const result = await awsUpload({
    ACL: 'private',
    Body: fs.createReadStream(fp),
    Bucket: code().S3Bucket,
    Key: code().S3Key,
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: 'arn:aws:kms:us-east-1:397853141546:key/72974a2e-cdd3-4fa0-8439-33e086470007'
  })

  debug(`uploaded: ${JSON.stringify(result)}`)
  return result
}

async function createFunction (versionId) {
  debug(`creating generating lambda ${versionId}`)
  try {
    const result = await awsCreateFunction(
      Object.assign(
        {
          FunctionName,
          Code: code(versionId),
          Publish: true
        },
        config()
      )
    )

    debug(`created generating lambda ${versionId}`)
    return result
  } catch (e) {
    debug(`error creating generating lambda ${versionId}: ${e}`)
    throw e
  }
}

async function updateFunctionCode (versionId) {
  debug(`updating generating code ${versionId}`)
  try {
    const result = await awsUpdateFunctionCode(
      Object.assign(
        {
          FunctionName,
          Publish: true
        },
        code(versionId)
      )
    )

    debug(`updated lambda code ${versionId}`)
    return result
  } catch (e) {
    debug(`error updating lambda code ${versionId}: ${e}`)
    throw e
  }
}

async function updateFunctionConfiguration () {
  debug(`updating generating config`)
  try {
    const result = await awsUpdateFunctionConfiguration(
      Object.assign(
        {
          FunctionName
        },
        config()
      )
    )

    debug(`updated generating config`)
    return result
  } catch (e) {
    debug(`error updating generating config: ${e}`)
    throw e
  }
}

async function updateFunction (versionId) {
  await updateFunctionConfiguration()
  return updateFunctionCode(versionId)
}

async function deploy (versionId) {
  try {
    return await createFunction(versionId)
  } catch (e) {
    return updateFunction(versionId)
  }
}

async function createAlias (Name, FunctionName, FunctionVersion) {
  debug(`creating alias: ${Name}`)
  try {
    const result = await awsCreateAlias({
      FunctionName,
      FunctionVersion,
      Name
    })
    debug(`created alias: ${Name}`)
    return result
  } catch (e) {
    debug(`error creating alias ${Name}: ${e}`)
    throw e
  }
}

async function updateAlias (Name, FunctionName, FunctionVersion) {
  debug(`updating alias: ${Name}`)
  try {
    const result = await awsUpdateAlias({
      FunctionName,
      FunctionVersion,
      Name
    })
    debug(`updated alias: ${Name}`)
    return result
  } catch (e) {
    debug(`error updating alias ${Name}: ${e}`)
    throw e
  }
}

async function alias (Name, FunctionName, FunctionVersion) {
  try {
    return await createAlias(Name, FunctionName, FunctionVersion)
  } catch (e) {
    return updateAlias(Name, FunctionName, FunctionVersion)
  }
}

async function main () {
  const { VersionId } = await upload(path.resolve(__dirname, 'generator.zip'))
  const result = await deploy(VersionId)
  await alias(require('../engine/package.json').version.replace(/\./g, '_'), result.FunctionName, result.Version)
  return result
}

module.exports = main

if (module === require.main) {
  main()
    .then(console.log)
    .catch(console.error)
}
