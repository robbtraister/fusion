'use strict'

// if consumer is not found, attempt to build without it
let alias = {}
try {
  // Consumer is included in the engine script and should be excluded from any individual template
  alias = {
    // 'fusion:consumer': require.resolve('../../src/react/shared/consumer')
  }
} catch (e) {}

module.exports = {
  alias,
  cacheWithContext: false,
  extensions: ['.js', '.json', '.jsx'],
  symlinks: false
}
