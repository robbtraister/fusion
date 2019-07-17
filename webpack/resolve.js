'use strict'

const { getAbsoluteRequire } = require('./utils')

const {
  bundleRoot
} = require('../env')

const resolve = {
  alias: {
    history: getAbsoluteRequire('history'),
    'prop-types': getAbsoluteRequire('prop-types'),
    react: getAbsoluteRequire('react'),
    'react-dom': getAbsoluteRequire('react-dom'),
    'react-dom/server': getAbsoluteRequire('react-dom/server'),
    'react-router-dom': getAbsoluteRequire('react-router-dom'),
    'styled-components': getAbsoluteRequire('styled-components'),
    '@robbtraister/fusion-components': getAbsoluteRequire('@robbtraister/fusion-components'),
    '~': bundleRoot
  },
  extensions: [
    // '.tsx',
    // '.ts',
    '.mjsx',
    '.mjs',
    '.jsx',
    '.js',
    '.yaml',
    '.yml',
    '.json',
    '.scss',
    '.sass',
    '.css'
  ]
}

module.exports = resolve
