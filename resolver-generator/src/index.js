'use strict'

const Generator = require('./generator')

const main = (resolver, envVars, region) => {
  return new Generator(resolver, envVars, region)
    .generate()
}

module.exports.handler = (event, context, callback) => {
  const s3event = event.Records[0].s3
  const bucket = s3event.bucket.name
  const resolverPath = s3event.object.key

  const region = event.Records[0].awsRegion || 'us-east-1'

  main(bucket, resolverPath, region)
    .then((result) => callback(null, result))
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  main('pagebuilder-fusion', 'environments/foo-sandbox/resolvers.json')
    .then(console.log)
    .catch(console.error)
}
