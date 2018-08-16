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
        InvocationType: InvocationType || 'RequestResponse',
        Qualifier: version,
        Payload: JSON.stringify({
          method: 'POST',
          path: uri,
          body: payload,
          queryStringParameters: {propagate: 'false'}
        })
      },
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

const publishOutputTypes = function publishOutputTypes (uri, payload) {
  return Promise.all(
    getOutputTypes()
      .map((outputType) => invoke(`${uri}/${outputType}`, payload, version))
  )
}

const publishToOtherVersions = function publishToOtherVersions (uri, payload) {
  return listOtherVerions()
    .then(versions => Promise.all(
      // this InvocationType makes the request "fire and forget"
      versions.map(v => invoke(uri, payload, v, 'Event'))
    ))
}

module.exports = {
  publishOutputTypes,
  publishToOtherVersions: (isDev) ? () => Promise.resolve() : publishToOtherVersions
}
