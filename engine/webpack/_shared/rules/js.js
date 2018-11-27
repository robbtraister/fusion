'use strict'

module.exports = {
  test: /\.[jt]s$/i,
  exclude: /\/node_modules\/(?!@arc-fusion\/)/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          '@babel/env',
          [
            '@babel/typescript',
            {
              allExtensions: true,
              isTSX: false
            }
          ]
        ]
      }
    }
  ]
}
