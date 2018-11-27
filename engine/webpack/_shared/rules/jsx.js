'use strict'

const { bundleRoot } = require('../../../environment')

module.exports = {
  test: /\.[jt]sx?$/i,
  exclude: /\/node_modules\/(?!@arc-fusion\/)/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        babelrc: false,
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
        ],
        plugins: [
          [
            'root-import',
            {
              rootPathPrefix: '~',
              rootPathSuffix: bundleRoot
            }
          ],
          [
            '@babel/proposal-decorators',
            {
              legacy: true
            }
          ],
          [
            '@babel/proposal-class-properties',
            {
              loose: true
            }
          ],
          '@babel/proposal-object-rest-spread'
        ]
      }
    }
  ]
}
