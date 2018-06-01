'use strict'

const Compiler = require('./compiler')

const main = (contextName, bundleName, envVars, region) => {
  return new Compiler(contextName, bundleName, envVars, region)
    .compile()
}

module.exports.handler = (event, context, callback) => {
  main(event.context, event.bundle, event.envVars, event.region)
    .then((result) => callback(null, result))
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  main('test', 'test')
    .then(console.log)
    .catch(console.error)
}
