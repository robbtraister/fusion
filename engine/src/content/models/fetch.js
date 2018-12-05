'use strict'

const BaseSource = require('./base')

const metrics = require('../../metrics')
const timer = require('../../utils/timer')

class FetchSource extends BaseSource {
  async fetchImpl (...args) {
    let success = false
    const latencyTic = timer.tic()
    try {
      const now = +new Date()
      const data = await this.config.fetch(...args)
      success = true
      metrics({
        'arc.fusion.content.bytes':
          {
            operation: 'fetch',
            source: this.name,
            value: data.length
          }
      })

      return {
        data,
        expires: this.getExpiration(now),
        lastModified: now
      }
    } finally {
      metrics({
        'arc.fusion.content.latency':
          {
            operation: 'fetch',
            source: this.name,
            result: success ? 'success' : 'error',
            value: latencyTic.toc()
          }
      })
    }
  }
}

module.exports = FetchSource
