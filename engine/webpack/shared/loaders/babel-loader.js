'use strict'

const {
  bundleRoot
} = require('../../../environment')

module.exports = {
  loader: 'babel-loader',
  options: {
    babelrc: false,
    presets: [
      'env',
      'react'
    ],
    plugins: [
      ['root-import', {
        rootPathPrefix: '~',
        rootPathSuffix: bundleRoot
      }],
      'transform-decorators-legacy',
      'transform-object-rest-spread'
    ],
    comments: false
  }
}
