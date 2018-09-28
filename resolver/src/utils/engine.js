'use strict'

const url = require('url')

const AWS = require('aws-sdk')
const request = require('request-promise-native')

const {
  httpEngine,
  lambdaEngine
} = require('../../environment')

const getHttpEngine = function getHttpEngine () {
  return function httpEngineHandler ({ method, uri, data }) {
    return request[(method || 'get').toLowerCase()]({
      uri: `${httpEngine}${uri}`,
      body: data,
      json: true
    })
  }
}

const getLambdaEngine = function getLambdaEngine () {
  const region = lambdaEngine.split(':')[3]
  const lambda = new AWS.Lambda(Object.assign({ region }))

  return function lambdaEngineHandler ({ method, uri, data, version }) {
    const METHOD = (method || 'GET').toUpperCase()
    const parts = url.parse(uri, true)
    return new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: lambdaEngine,
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify({
          method: METHOD,
          httpMethod: METHOD,
          headers: {
            'Content-Type': 'application/json'
          },
          body: data && JSON.stringify(data),
          path: parts.pathname,
          queryStringParameters: parts.query,
          protocol: 'http'
        }),
        Qualifier: version || 'production'
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        if (data.StatusCode === 200) {
          const json = JSON.parse(data.Payload)
          if (json.statusCode === 200) {
            try {
              resolve(JSON.parse(json.body))
            } catch (e) {
              resolve(json.body)
            }
          } else {
            reject(json)
          }
        } else {
          reject(data)
        }
      })
    })
  }
}

function getEngine () {
  const engine = (httpEngine && !lambdaEngine)
    ? getHttpEngine()
    : getLambdaEngine()

  return (args) => engine(args)
    .catch((e) => {
      e.isEngine = true
      throw e
    })
}

module.exports = getEngine()
