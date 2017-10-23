'use strict'

const path = require('path')

const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    return require(fp)
  }

module.exports = options => (fp, data, cb) => {
  const fn = load(fp)
  const result = fn(data, cb)

  return (result instanceof Promise)
    ? result.then(cb)
    : result
}
