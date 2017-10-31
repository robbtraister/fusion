'use strict'

const path = require('path')

const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    return require(fp)
  }

module.exports = options => (templateFile, data, cb) => {
  const fn = load(templateFile)
  const result = fn(data, cb)

  if (result instanceof Promise) {
    result.then(r => cb(null, r))
  }
}
