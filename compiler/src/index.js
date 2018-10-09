'use strict'

const compile = require('./compile')

module.exports.handler = (event, context, callback) => {
  compile(event.bundle, event.variables && event.variables.CONTEXT_PATH)
    .then((result) => { callback(null, result) })
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  compile('test bundle')
    .then(console.log)
    .catch(console.error)
}
