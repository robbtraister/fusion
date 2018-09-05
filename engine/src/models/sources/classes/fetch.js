'use strict'

const BaseSource = require('./base')

class FetchSource extends BaseSource {
  constructor (name, config) {
    super(name, config)

    if (config.fetch && config.fetch instanceof Function) {
      this.fetch = config.fetch.bind(this)
    }
  }
}

module.exports = FetchSource
