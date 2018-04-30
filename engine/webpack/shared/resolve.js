'use strict'

// if consumer is not found, attempt to build without it
let alias = {}
try {
  alias = {
    'consumer': require.resolve('../../src/react/shared/consumer.js')
  }
} catch (e) {}

module.exports = {
  alias,
  extensions: ['.js', '.jsx']
}
