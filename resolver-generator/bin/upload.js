#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:resolver-generator')

const AWS = require('aws-sdk')
const s3 = new AWS.S3({region: 'us-east-1'})
const lambda = new AWS.Lambda({region: 'us-east-1'})

const {
  datadogApiKey,
  fusionRelease,
  S3Bucket,
  S3ResolverGeneratorKey: S3Key,
  resolverGeneratorArtifact
} = require('./configs')

const awsUpload = promisify(s3.upload.bind(s3))
const createFunction = promisify(lambda.createFunction.bind(lambda))
const updateFunctionCode = promisify(lambda.updateFunctionCode.bind(lambda))
const updateFunctionConfig = promisify(lambda.updateFunctionConfiguration.bind(lambda))

const FunctionName = 'fusion-generator'

async function upload (fp) {
  debug(`uploading ${fp}`)

  const result = await awsUpload(
    Object.assign(
      resolverGeneratorArtifact(),
      { Body: fs.createReadStream(fp) }
    )
  )

  debug(`uploaded: ${JSON.stringify(result)}`)
  return result
}

async function createGeneratorFunction () {
  try {
    return await createFunction({
      FunctionName,
      Publish: true,
      Code: {
        S3Bucket,
        S3Key
      },
      Environment: {
        Variables: {
          DEBUG: 'fusion:*',
          DATADOG_API_KEY: datadogApiKey,
          FUSION_RELEASE: fusionRelease
        }
      },
      Handler: 'resolver-generator/src/index.handler',
      MemorySize: 512,
      Role: 'arn:aws:iam::397853141546:role/fusion-generator',
      Runtime: 'nodejs8.10',
      Timeout: 60
    })
  } catch (e) {
    debug(`error creating generator lambda: ${e}`)
    throw e
  }
}

async function updateGeneratorCode () {
  debug(`updating resolver-generator lambda with latest code`)
  try {
    const result = await updateFunctionCode(
      {
        FunctionName,
        Publish: true,
        S3Bucket,
        S3Key
      }
    )
    debug(`updated resolver-generator lambda to version ${result.Version}`)
    return result
  } catch (e) {
    debug(`error updating resolver-generator code: ${e}`)
    throw e
  }
}

// used to reliably set the DATADOG_API_KEY and FUSION_RELEASE in published versions
async function updateGeneratorConfig () {
  debug(`updating resolver-generator lambda with latest configuration`)
  try {
    const result = await updateFunctionConfig(
      {
        FunctionName,
        Environment: {
          Variables: {
            DEBUG: 'fusion:*',
            DATADOG_API_KEY: datadogApiKey,
            FUSION_RELEASE: fusionRelease
          }
        }
      }
    )
    debug(`updated resolver-generator lambda configuration`)
    return result
  } catch (e) {
    debug(`error updating resolver-generator configuration: ${e}`)
    throw e
  }
}

async function main () {
  await upload(path.resolve(__dirname, '../dist/resolver-generator.zip'))
  try {
    return await createGeneratorFunction()
  } catch (e) {
    await updateGeneratorConfig()
    return updateGeneratorCode()
  }
}

module.exports = main

if (module === require.main) {
  main()
    .then(console.log)
    .catch(console.error)
}
