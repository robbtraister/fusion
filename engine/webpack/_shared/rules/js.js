'use strict'

module.exports = (env) => ({
  test: /\.js$/i,
  exclude: /\/node_modules\/(?!@arc-fusion\/)/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          '@babel/env'
        ]
      }
    }
  ]
})
