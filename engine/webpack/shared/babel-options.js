'use strict'

const {
  bundleSrcRoot
} = require('../../environment')

module.exports = {
  babelrc: false,
  presets: [
    '@babel/env',
    '@babel/react',
    ['@babel/typescript', {
      allExtensions: true,
      isTSX: true
    }]
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
  ]
}
