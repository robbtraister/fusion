'use strict'

const metrics = require('../../metrics')
const timer = require('../../utils/timer')

function wrapOperation (fn) {
  return async function (...args) {
    let result = 'error'
    const latencyTic = timer.tic()
    try {
      const data = await fn(...args)
      result = 'success'
      return data
    } finally {
      metrics({
        'arc.fusion.db.duration':
          {
            operation: fn.name,
            result,
            value: latencyTic.toc()
          }
      })
    }
  }
}

function metricsWrapper (model) {
  return Object.assign(
    {},
    ...Object.values(model)
      .map((fn) => ({ [fn.name]: wrapOperation(fn) }))
  )
}

module.exports = metricsWrapper
