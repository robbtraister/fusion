'use strict'

const _get = require('lodash.get')

module.exports = (obj, content = {}, prefix = '') => {
  const regexp = new RegExp(`\\{\\{${prefix ? prefix.replace(/\.*$/, '.') : ''}([^}]+)\\}\\}`, 'g')
  return JSON.parse(
    JSON.stringify(obj)
      .replace(regexp, function () {
        const original = arguments[0]
        // use the last group (we don't know what's in prefix)
        // but the arguments array ends with offset and the entire string
        const property = arguments[arguments.length - 3]
        const replacement = _get(content, property) || original
        return JSON.stringify(replacement).replace(/^"(.*)"$/, (_, value) => value)
      })
  )
}
