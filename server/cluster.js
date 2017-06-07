#!/usr/bin/env node

'use strict'

const cluster = require('cluster')

function worker () {
  require('.')()
}

function master (workerCount) {
  console.error('Starting workers:', workerCount)

  for (let w = 0; w < workerCount; w++) {
    cluster.fork()
  }
  cluster.on('exit', function replaceWorker (worker, code, signal) {
    cluster.fork()
  })
}

if (module === require.main) {
  if (cluster.isMaster) {
    master(Number(process.env.WORKERS) || require('os').cpus().length)
  } else {
    worker()
  }
}
