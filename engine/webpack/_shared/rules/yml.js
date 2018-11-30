'use strict'

module.exports = {
  test: /\.ya?ml$/i,
  exclude: /\/node_modules\/(?!@arc-fusion\/)/,
  use: [
    {
      loader: 'json-loader'
    },
    {
      loader: 'yaml-loader'
    }
  ]
}
