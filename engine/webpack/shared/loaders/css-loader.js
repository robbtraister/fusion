'use strict'

const { isDev } = require('../../../environment')

module.exports = {
  loader: 'css-loader',
  options: {
    minimize: !isDev,
    url: false
  }
}
