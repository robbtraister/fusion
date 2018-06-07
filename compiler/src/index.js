'use strict'

const Compiler = require('./compiler')

const main = (environment, bundleName, variables, region) => {
  return new Compiler(environment, bundleName, variables, region)
    .compile()
}

module.exports.handler = (event, context, callback) => {
  main(process.env.ENVIRONMENT, event.bundle, event.variables, event.region)
    .then((result) => { callback(null, result) })
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  main('localhost', 'test.zip')
    .then(console.log)
    .catch(console.error)
}
