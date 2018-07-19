'use strict'

const {
  bundleSrcRoot
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
        rootPathSuffix: bundleSrcRoot
      }],
      'transform-decorators-legacy',
      'transform-object-rest-spread'
    ],
    comments: false
  }
}
