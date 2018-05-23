'use strict'

const Lambda = require('aws-sdk').Lambda

const {
  functionName,
  isDev,
  region,
  version
} = require('../../../environment')

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

const publishToVersion = function publishToVersion (uri, payload, version) {
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
          body: payload
        })
      },
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

const publishToOtherVersions = function publishToOtherVersions (uri, payload) {
  return listOtherVerions()
    .then(versions => Promise.all(versions.map(v => publishToVersion(uri, payload, v))))
}

module.exports = {
  publishToOtherVersions: (isDev) ? publishToOtherVersions : () => Promise.resolve()
}
