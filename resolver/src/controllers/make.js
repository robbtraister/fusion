'use strict'

const AWS = require('aws-sdk')
const request = require('request-promise-native')

const resolve = require('./resolve')

const endpoint = function endpoint (data) {
  return `/render/template/${data.template}`
}

const getHttpMake = function getHttpMake () {
  const engineHandler = process.env.HTTP_ENGINE

  return function httpMake (uri) {
    return resolve(uri)
      .then((data) => request.post({
        uri: `${engineHandler}${endpoint(data)}`,
        json: data
      }))
  }
}

const getLambdaMake = function getLambdaMake () {
  const functionArn = process.env.LAMBDA_ENGINE || `arn:aws:lambda:${process.env.AWS_REGION || 'us-east-1'}:${process.env.AWS_ACCOUNT_ID || '397853141546'}:function:fusion-engine-${process.env.ENVIRONMENT}-engine}`
  const region = functionArn.split(':')[3]
  const lambda = new AWS.Lambda(Object.assign({region}))

  return function lambdaMake (uri, version) {
    return resolve(uri)
      .then((data) => new Promise((resolve, reject) => {
        lambda.invoke({
          FunctionName: functionArn,
          InvocationType: 'RequestResponse',
          LogType: 'None',
          Payload: JSON.stringify({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: data,
            path: endpoint(data),
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
      }))
  }
}

module.exports = (process.env.HTTP_ENGINE && !process.env.LAMBDA_ENGINE)
  ? getHttpMake()
  : getLambdaMake()
