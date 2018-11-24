'use strict'

const { isDev } = require('../../environment')

const resolve = {
  cacheWithContext: false,
  extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  symlinks: false
}

if (isDev) {
  resolve.modules = [
    '/workdir/linked_modules',
    // TODO: remove this after all clients updated to 2.1
    '/workdir/engine/bundle/linked_modules',
    'node_modules'
  ]
}

module.exports = resolve
