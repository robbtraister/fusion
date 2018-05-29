'use strict'

// if consumer is not found, attempt to build without it
let alias = {}
try {
  alias = {
    // consumer should be auto-applied
    // 'consumer': require.resolve('../../src/react/shared/consumer')
  }
} catch (e) {}

module.exports = {
  alias,
  extensions: ['.js', '.jsx']
}
