'use strict'

const url = require('url')

const AWS = require('aws-sdk')
const request = require('request-promise-native')

const { RedirectError } = require('../errors')

const {
  httpEngine,
  lambdaEngine
} = require('../../environment')

const parseJson = function parseJson (json) {
  if (typeof json === 'string') {
    try {
      return JSON.parse(json)
    } catch (e) {}
  }
  return json
}

const handleResponse = function handleResponse (response) {
  if (response.statusCode >= 400) {
    throw response
  }

  if (response.statusCode >= 300 && response.headers.location) {
    throw new RedirectError(response.headers.location, response.statusCode)
  }

  return {
    body: parseJson(response.body),
    headers: response.headers
  }
}

const getHttpEngine = function getHttpEngine () {
  return async function httpEngineHandler ({ method, uri, data, arcSite, cacheMode }) {
    return request[(method || 'get').toLowerCase()]({
      uri: `${httpEngine}${uri}`,
      body: data,
      json: true,
      headers: {
        'Arc-Site': arcSite,
        'Fusion-Cache-Mode': cacheMode
      },
      followRedirect: false,
      resolveWithFullResponse: true,
      simple: false
    })
  }
}

const getLambdaEngine = function getLambdaEngine () {
  const region = lambdaEngine.split(':')[3]
  const lambda = new AWS.Lambda(Object.assign({ region }))

  return async function lambdaEngineHandler ({ method, uri, data, arcSite, cacheMode, version }) {
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
            'Arc-Site': arcSite,
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
          resolve(JSON.parse(data.Payload))
        } else {
          reject(data)
        }
      })
    })
  }
}

const engine = (httpEngine && !lambdaEngine)
  ? getHttpEngine()
  : getLambdaEngine()

module.exports = async function (args) {
  try {
    const response = await engine(args)

    return handleResponse(response)
  } catch (e) {
    e.isEngine = true
    throw e
  }
}
