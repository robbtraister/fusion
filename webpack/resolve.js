'use strict'

const path = require('path')

const { bundleRoot } = require('../env')

function getAbsoluteRequire (mod) {
  return require
    .resolve(mod)
    .replace(
      new RegExp(
        `([\\/]node_modules[\\/]${mod.replace(/[\\/]/g, '[\\\\/]')}).*`
      ),
      (_, g) => g
    )
}

const resolve = {
  alias: {
    history: getAbsoluteRequire('history'),
    'prop-types': getAbsoluteRequire('prop-types'),
    react: getAbsoluteRequire('react'),
    'react-dom': getAbsoluteRequire('react-dom'),
    'react-dom/server': getAbsoluteRequire('react-dom/server'),
    'react-router-dom': getAbsoluteRequire('react-router-dom'),
    'styled-components': getAbsoluteRequire('styled-components'),
    '@robbtraister/fusion-components': path.resolve(__dirname, '../src/fusion/components'),
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
