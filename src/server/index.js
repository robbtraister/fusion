#!/usr/bin/env node

'use strict'

const app = require('./app')

const { bundleRoot, defaultPort } = require('../../env')

function server (options = {}) {
  const port = options.port || defaultPort

  app(options).listen(port, err => {
    err ? console.error(err) : console.log(`Listening on port: ${port}`)
  })
}

if (module === require.main) {
  const path = require('path')
  const packagePath = path.join(bundleRoot, 'package.json')
  server(require(packagePath).fusion || {})
}
