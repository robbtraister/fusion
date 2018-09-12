'use strict'

const { isDev } = require('../../environment')

const resolve = {
  cacheWithContext: false,
  extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  symlinks: false
}

if (isDev) {
  resolve.modules = [
    '/workdir/engine/bundle/linked_modules',
    'node_modules'
  ]
}

module.exports = resolve
