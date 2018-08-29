'use strict'

const Lambda = require('aws-sdk').Lambda

const {
  functionName,
  isDev,
  region,
  version
} = require('../../../environment')

const {
  getOutputTypes
} = require('../../assets/info')

const lambda = new Lambda({region})

const listVersions = function listVersions () {
  return new Promise((resolve, reject) => {
    lambda.listVersionsByFunction(
      {FunctionName: functionName},
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

const listOtherVerions = function listOtherVerions () {
  return listVersions()
    .then((versions) => versions.filter(v => v !== version))
}

const invoke = function invoke (uri, payload, version, InvocationType = 'RequestResponse') {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      {
        FunctionName: functionName,
        InvocationType,
        Qualifier: version,
        Payload: JSON.stringify({
          method: 'POST',
          // serverless-http uses `httpMethod` property
          httpMethod: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          path: uri,
          body: payload,
          queryStringParameters: {propagate: 'false'}
        })
      },
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

const publishOutputTypes = function publishOutputTypes (uri, payload, InvocationType = 'RequestResponse') {
  return Promise.all(
    getOutputTypes()
      .map((outputType) => invoke(`${uri}/${outputType}`, payload, version, InvocationType))
  )
}

const publishToOtherVersions = function publishToOtherVersions (uri, payload) {
  return listOtherVerions()
    .then(versions => Promise.all(
      // this InvocationType makes the request "fire and forget"
      versions.map(version => invoke(uri, payload, version, 'Event'))
    ))
}

module.exports = {
  publishOutputTypes,
  publishToOtherVersions: (isDev) ? () => Promise.resolve() : publishToOtherVersions
}
