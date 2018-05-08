'use strict'

const AWS = require('aws-sdk')

const lambda = new AWS.Lambda()

const code = () => ({
  S3Bucket: 'pagebuilder-fusion',
  S3Key: 'code.zip',
  S3ObjectVersion: 'pr4siq1w8Muj97BLJDrPubdwbU9TgLaL'
})

const config = () => ({
  Environment: {
    Variables: {}
  },
  Handler: 'src/index.serverless',
  KMSKeyArn: null,
  MemorySize: 512,
  Publish: true,
  Role: 'arn:aws:iam::397853141546:role/fusion-engine-staging-us-east-1-lambdaRole',
  Runtime: 'nodejs8.10',
  Timeout: 10
})

function create () {
  return new Promise((resolve, reject) => {
    lambda.createFunction(Object.assign(
      { FunctionName: 'fusion-lambda-test' },
      config(),
      { Code: code() }
    ), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

// function deploy () {
//   return new Promise((resolve, reject) => {
//     cfn.updateStack({
//       StackName: 'cfn-fusion-lambda-test',
//       TemplateBody: JSON.stringify(require('./cfn.json'))
//     }, (err, data) => {
//       err ? reject(err) : resolve(data)
//     })
//   })
// }

function updateCode () {
  return new Promise((resolve, reject) => {
    lambda.updateFunctionCode(Object.assign(
      {
        FunctionName: 'fusion-lambda-test',
        Publish: true
      },
      code()
    ), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function updateConfig () {
  return new Promise((resolve, reject) => {
    lambda.updateFunctionConfiguration(Object.assign(
      { FunctionName: 'fusion-lambda-test' },
      config()
    ), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function update () {
  return updateConfig()
    .then(() => updateCode())
}

function deploy () {
  return create()
    .catch(() => update())
}

module.exports = deploy

if (module === require.main) {
  deploy()
    .then(console.log)
    .catch(console.error)
}
