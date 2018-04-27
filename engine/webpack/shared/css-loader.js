'use strict'

const { isDev } = require('../../src/environment')

module.exports = {
  loader: 'css-loader',
  options: {
    minimize: !isDev
  }
}
