'use strict'

module.exports = {
  resolve: {
    cacheWithContext: false,
    extensions: ['.tsx', '.jsx', '.ts', '.js', '.json'],
    modules: [
      '/workdir/linked_modules',
      // TODO: remove this after all clients updated to 2.1
      '/workdir/engine/bundle/linked_modules',
      'node_modules'
    ],
    symlinks: false
  }
}
