'use strict'

const _get = require('lodash.get')

module.exports = (obj, content = {}, prefix = '') => {
  const regexp = new RegExp(`\\{\\{${prefix || ''}([^}]+)\\}\\}`, 'g')
  return JSON.parse(
    JSON.stringify(obj)
      .replace(regexp, function (_, ...groups) {
        const property = groups.pop()
        return _get(content, property) || property
      })
  )
}
