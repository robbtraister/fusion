'use strict'

const Generator = require('./generator')

const main = (resolver, envVars, region) => {
  return new Generator(resolver, envVars, region)
    .generate()
}

module.exports.handler = (event, callback) => {
  const bucket = event.s3.bucket.name
  const resolverPath = event.s3.object.key
  
  // TODO: Figure out how we pass region
  const region = event.s3.region || 'us-east-1'

  main(bucket, resolverPath, region)
    .then((result) => callback(null, result))
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  main('pagebuilder-fusion-resolver-service', 'environments/foo-sandbox/resolvers.json')
    .then(console.log)
    .catch(console.error)
}
