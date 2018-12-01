'use strict'

const { bundleRoot } = require('../../../../environment')

const only = (bundleRoot)
  ? [new RegExp(`^${bundleRoot.replace(/\/*$/, '/')}`)]
  : undefined

require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  ignore: [/\/node_modules\//],
  only,
  plugins: [
    [
      'transform-require-ignore',
      { extensions: ['.css', '.sass', '.scss'] }
    ],
    [
      'root-import',
      {
        rootPathPrefix: '~',
        rootPathSuffix: bundleRoot
      }
    ],
    [
      '@babel/proposal-decorators',
      { legacy: true }
    ],
    [
      '@babel/proposal-class-properties',
      { loose: true }
    ],
    '@babel/proposal-object-rest-spread'
  ],
  presets: [
    '@babel/env',
    '@babel/react',
    [
      '@babel/typescript',
      {
        allExtensions: true,
        isTSX: true
      }
    ]
  ]
})
