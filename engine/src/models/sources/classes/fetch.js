'use strict'

const BaseSource = require('./base')

class FetchSource extends BaseSource {
  async fetch (...args) {
    const data = await this.config.fetch(...args)
    return this.transform(data)
  }
}

module.exports = FetchSource
