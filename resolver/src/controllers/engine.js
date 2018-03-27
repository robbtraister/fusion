'use strict'

const url = require('url')

const AWS = require('aws-sdk')
const request = require('request-promise-native')

const getHttpEngine = function getHttpEngine () {
  const engineHandler = process.env.HTTP_ENGINE

  return function httpEngine ({method, uri, data}) {
    return request[(method || 'get').toLowerCase()]({
      uri: `${engineHandler}${uri}`,
      body: data,
      json: true
    })
  }
}

const getLambdaEngine = function getLambdaEngine () {
  const functionArn = process.env.LAMBDA_ENGINE || `arn:aws:lambda:${process.env.AWS_REGION || 'us-east-1'}:${process.env.AWS_ACCOUNT_ID || '397853141546'}:function:fusion-engine-${process.env.ENVIRONMENT}-engine}`
  const region = functionArn.split(':')[3]
  const lambda = new AWS.Lambda(Object.assign({region}))

  return function lambdaEngine ({method, uri, data, version}) {
    const parts = url.parse(uri, true)
    return new Promise((resolve, reject) => {
      lambda.invoke({
        FunctionName: functionArn,
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify({
          method: (method || 'GET').toUpperCase(),
          headers: {
            'Content-Type': 'application/json'
          },
          body: data,
          path: parts.pathname,
          queryStringParameters: parts.query,
          protocol: 'http'
        }),
        Qualifier: version || '$LATEST'
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        if (data.StatusCode === 200) {
          const json = JSON.parse(data.Payload)
          if (json.statusCode === 200) {
            resolve(json.body)
          } else {
            reject(json.body)
          }
        } else {
          reject(data)
        }
      })
    })
  }
}

module.exports = (process.env.HTTP_ENGINE && !process.env.LAMBDA_ENGINE)
  ? getHttpEngine()
  : getLambdaEngine()
