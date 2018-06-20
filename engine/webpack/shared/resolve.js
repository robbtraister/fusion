'use strict'

// if consumer is not found, attempt to build without it
let alias = {}
try {
  alias = {
    'fusion:consumer': require.resolve('../../src/react/shared/consumer')
  }
} catch (e) {}

module.exports = {
  alias,
  cacheWithContext: false,
  extensions: ['.js', '.json', '.jsx'],
  symlinks: false
}
