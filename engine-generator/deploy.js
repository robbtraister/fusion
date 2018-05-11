'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:engine-generator')

const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
const s3 = new AWS.S3({region: 'us-east-1'})

const FunctionName = `fusion-generator-engine`

const createFunction = promisify(lambda.createFunction.bind(lambda))
const updateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const updateFunctionConfiguration = promisify(lambda.updateFunctionConfiguration.bind(lambda))
const upload = promisify(s3.upload.bind(s3))

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
  MemorySize: 2048,
  Role: 'arn:aws:iam::397853141546:role/fusion-generator',
  Runtime: 'nodejs8.10',
  Timeout: 300
})

async function uploadToS3 (fp) {
  debug(`uploading ${fp}`)

  const result = await upload({
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

async function create (versionId) {
  debug(`creating generating lambda ${versionId}`)
  try {
    const result = await createFunction(
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

async function updateCode (versionId) {
  debug(`updating generating code ${versionId}`)
  try {
    const result = await updateFunctionCode(
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

async function updateConfig () {
  debug(`updating generating config`)
  try {
    const result = await updateFunctionConfiguration(
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

async function update (versionId) {
  await updateConfig()
  return updateCode(versionId)
}

async function deploy (versionId) {
  try {
    return await create(versionId)
  } catch (e) {
    return update(versionId)
  }
}

async function main () {
  const { VersionId } = await uploadToS3(path.resolve(__dirname, 'generator.zip'))
  return deploy(VersionId)
}

module.exports = main

if (module === require.main) {
  main()
    .then(console.log)
    .catch(console.error)
}
