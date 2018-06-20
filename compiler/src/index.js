'use strict'

const compile = require('./compile')

module.exports.handler = (event, context, callback) => {
  compile(event.bundle)
    .then((result) => { callback(null, result) })
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  compile('test.zip')
    .then(console.log)
    .catch(console.error)
}
