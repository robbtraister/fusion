'use strict'

const path = require('path')

module.exports = (env) => ({
  test: /\.hbs$/i,
  exclude: /\/node_modules\/(?!@arc-fusion\/)/,
  use: [
    {
      loader: 'handlebars-loader',
      options: {
        runtime: 'handlebars/runtime'
      }
    },
    {
      loader: path.resolve(__dirname, '..', '..', 'loaders', 'strip-frontmatter-loader.js')
    },
    {
      loader: 'yaml-frontmatter-loader'
    }
  ]
})
