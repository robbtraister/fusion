'use strict'

const CachedSource = require('./cached')

const expandProperties = function expandProperties (string, properties) {
  return string.replace(/\{([^}]+)\}/g, function (match, prop) {
    return (prop === 'key')
      ? properties
      : properties[prop.replace(/^key\./, '')] || match
  })
}

class JsonSource extends CachedSource {
  resolve (key) {
    const path = expandProperties(this.pattern, key)

    const query = this.params
      .map((param) => {
        return (param.dropWhenEmpty && !(param.name in key))
          ? null
          : `${param.name}=${key[param.name] || param.default}`
      })
      .filter(v => v)
      .join('&')

    return this.formatUri(`${path}${query ? `?${query}` : ''}`)
  }
}

module.exports = JsonSource
