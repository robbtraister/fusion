'use strict'

const _get = require('lodash.get')

module.exports = (obj, content = {}, prefix = '') => {
  const regexp = new RegExp(`\\{\\{${prefix ? prefix.replace(/\.*$/, '.') : ''}([^}]+)\\}\\}`, 'g')
  return JSON.parse(
    JSON.stringify(obj)
      .replace(regexp, function (original, property) {
        const replacement = _get(content, property) || original
        return JSON.stringify(replacement).replace(/^"(.*)"$/, (_, value) => value)
      })
  )
}
