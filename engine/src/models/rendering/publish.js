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

const postRequest = function postRequest (uri, payload, version) {
  return new Promise((resolve, reject) => {
    lambda.invoke(
      {
        FunctionName: functionName,
        // this InvocationType makes the request "fire and forget"
        InvocationType: 'Event',
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
      .map((outputType) => postRequest(`${uri}/${outputType}`, payload, version))
  )
}

const publishToOtherVersions = function publishToOtherVersions (uri, payload) {
  return listOtherVerions()
    .then(versions => Promise.all(versions.map(v => postRequest(uri, payload, v))))
}

module.exports = {
  publishOutputTypes,
  publishToOtherVersions: (isDev) ? () => Promise.resolve() : publishToOtherVersions
}
