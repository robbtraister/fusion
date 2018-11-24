'use strict'

const Lambda = require('aws-sdk').Lambda

const {
  functionName,
  isDev,
  region,
  deployment
} = require('../../../environment')

const { components } = require('../../../manifest')

const allOutputTypes = Object.keys(components.outputTypes)

const lambda = new Lambda({ region })

const listVersions = async function listVersions () {
  return new Promise((resolve, reject) => {
    lambda.listVersionsByFunction(
      { FunctionName: functionName },
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

const listOtherVerions = async function listOtherVerions () {
  const versions = await listVersions()
  return versions.filter(v => v !== deployment)
}

const invoke = async function invoke (uri, body, Qualifier, InvocationType = 'RequestResponse') {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      {
        FunctionName: functionName,
        InvocationType,
        Qualifier,
        Payload: JSON.stringify({
          method: 'POST',
          // serverless-http uses `httpMethod` property
          httpMethod: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          path: uri,
          body,
          queryStringParameters: { propagate: 'false' }
        })
      },
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

const publishOutputTypes = async function publishOutputTypes (uri, body, InvocationType = 'RequestResponse') {
  return Promise.all(
    allOutputTypes.map((outputType) =>
      invoke(`${uri}/${outputType}`, body, deployment, InvocationType)
    )
  )
}

const publishToOtherVersions = async function publishToOtherVersions (uri, body) {
  const versions = await listOtherVerions()
  return Promise.all(
    // this InvocationType makes the request "fire and forget"
    versions.map(version =>
      invoke(uri, body, version, 'Event')
    )
  )
}

module.exports = {
  publishOutputTypes,
  publishToOtherVersions: (isDev)
    ? async () => Promise.resolve()
    : publishToOtherVersions
}
