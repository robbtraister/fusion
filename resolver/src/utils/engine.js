'use strict'

const url = require('url')

const AWS = require('aws-sdk')
const request = require('request-promise-native')

const { RedirectError } = require('../errors')

const {
  httpEngine,
  lambdaEngine
} = require('../../environment')

const getHttpEngine = function getHttpEngine () {
  return async function httpEngineHandler ({ method, uri, data, cacheMode }) {
    const response = await request[(method || 'get').toLowerCase()]({
      uri: `${httpEngine}${uri}`,
      body: data,
      json: true,
      headers: {
        'Fusion-Cache-Mode': cacheMode
      },
      followRedirect: false,
      resolveWithFullResponse: true,
      simple: false
    })

    if (response.statusCode >= 400) {
      throw response
    }

    if (response.statusCode >= 300 && response.headers.location) {
      throw new RedirectError(response.headers.location, response.statusCode)
    }

    return response.body
  }
}

const getLambdaEngine = function getLambdaEngine () {
  const region = lambdaEngine.split(':')[3]
  const lambda = new AWS.Lambda(Object.assign({ region }))

  return async function lambdaEngineHandler ({ method, uri, data, cacheMode, version }) {
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
            'Content-Type': 'application/json',
            'Fusion-Cache-Mode': cacheMode
          },
          body: data && JSON.stringify(data),
          path: parts.pathname,
          queryStringParameters: parts.query,
          protocol: 'http'
        }),
        Qualifier: version || 'live'
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        if (data.StatusCode === 200) {
          const response = JSON.parse(data.Payload)

          if (response.statusCode >= 400) {
            return reject(response)
          }

          if (response.statusCode >= 300 && response.headers.location) {
            return reject(new RedirectError(response.headers.location, response.statusCode))
          }

          try {
            resolve(JSON.parse(response.body))
          } catch (e) {
            resolve(response.body)
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

  return async function (args) {
    try {
      return await engine(args)
    } catch (e) {
      e.isEngine = true
      throw e
    }
  }
}

module.exports = getEngine()
