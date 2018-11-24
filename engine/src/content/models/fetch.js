'use strict'

const BaseSource = require('./base')

class FetchSource extends BaseSource {
  async fetchImpl (...args) {
    return {
      data: await this.config.fetch(...args),
      expires: this.getExpiration()
    }
  }
}

module.exports = FetchSource
