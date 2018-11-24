'use strict'

const compilerFactory = require('./compiler')

module.exports = (env) => {
  const compile = compilerFactory(env)

  return async function renderJsxJs (filePath, props, callback) {
    try {
      callback(null, await compile(props))
    } catch (err) {
      console.error(err)
      callback(err)
    }
  }
}
