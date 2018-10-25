'use strict'

const _get = require('lodash.get')

module.exports = (obj, content = {}) =>
  JSON.parse(
    JSON.stringify(obj)
      .replace(/\{\{(content|globalContent)\.([^}]+)\}\}/g, function (_, prefix, property) {
        return _get(content, property) || property
      })
  )
