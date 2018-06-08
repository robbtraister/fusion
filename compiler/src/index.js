'use strict'

const Compiler = require('./compiler')

const main = (region, environment, bundleName) => {
  return new Compiler(region, environment, bundleName)
    .compile()
}

module.exports.handler = (event, context, callback) => {
  main(process.env.REGION, process.env.ENVIRONMENT, event.bundle)
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
