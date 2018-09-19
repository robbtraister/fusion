'use strict'

const BaseSource = require('./base')

class FetchSource extends BaseSource {
  async fetch (...args) {
    return Promise.resolve()
      .then(() => this.config.fetch(...args))
      .then((data) => this.transform(data))
  }
}

module.exports = FetchSource
