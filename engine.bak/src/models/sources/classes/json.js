'use strict'

const _get = require('lodash.get')

const CachedSource = require('./cached')

const expandProperties = function expandProperties (string, properties) {
  return string.replace(/\{([^}]+)\}/g, function (match, prop) {
    return (/^(key|query)$/.test(prop))
      ? properties
      : _get(properties, prop.replace(/^(key|query)\./, '')) || match
  })
}

class JsonSource extends CachedSource {
  resolve (query, options) {
    const path = expandProperties(this.pattern, query)

    const params = this.params
      .map((param) => {
        return (param.dropWhenEmpty && !(param.name in query))
          ? null
          : `${param.name}=${query[param.name] || param.default}`
      })
      .filter(v => v)
      .join('&')

    return this.formatUri(`${path}${params ? `?${params}` : ''}`, options)
  }
}

module.exports = JsonSource
