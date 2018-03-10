#!/usr/bin/env node

'use strict'

const cluster = require('cluster')

function worker () {
  require('./app')()
}

if (cluster.isMaster) {
  let workerCount = process.env.hasOwnProperty('WORKERS')
    ? Number(process.env.WORKERS) || require('os').cpus().length
    : 1

  if (workerCount === 1) {
    worker()
  } else {
    for (let w = 0; w < workerCount; w++) {
      cluster.fork()
    }
    cluster.on('exit', function replaceWorker (worker, code, signal) {
      cluster.fork()
    })
  }
} else {
  worker()
}
