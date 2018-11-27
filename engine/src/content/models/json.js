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
  constructor (config) {
    super(config)

    if (config.params) {
      this.params = (config.params instanceof Object && !(config.params instanceof Array))
        ? Object.keys(config.params)
          .map((name) => ({
            name,
            type: config.params[name]
          }))
        : config.params

      if (this.params) {
        this.params.forEach((p) => { p.displayName = p.displayName || p.name })
      }
    }
  }

  resolveQuery (query) {
    const path = expandProperties(this.config.pattern, query)

    const params = (this.params || [])
      .map((param) => {
        return (param.dropWhenEmpty && !(param.name in query))
          ? null
          : `${param.name}=${query[param.name] || param.default}`
      })
      .filter(v => v)
      .join('&')

    return `${path}${params ? `?${params}` : ''}`
  }
}

module.exports = JsonSource
