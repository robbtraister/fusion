'use strict'

const {
  bundleSrcRoot
} = require('../../../environment')

module.exports = {
  loader: 'babel-loader',
  options: {
    babelrc: false,
    presets: [
      '@babel/env',
      '@babel/react'
    ],
    plugins: [
      ['root-import', {
        rootPathPrefix: '~',
        rootPathSuffix: bundleSrcRoot
      }],
      ['@babel/proposal-decorators', {
        legacy: true
      }],
      ['@babel/proposal-class-properties', {
        loose: true
      }],
      '@babel/proposal-object-rest-spread'
    ],
    comments: false
  }
}
