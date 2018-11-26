'use strict'

const path = require('path')

module.exports = (env) => ({
  test: /\.hbs$/i,
  exclude: /\/node_modules\/(?!@arc-fusion\/)/,
  use: [
    {
      loader: path.resolve(__dirname, '..', '..', 'loaders', 'hbs-frontmatter-loader.js'),
      options: {
        runtime: 'handlebars/runtime'
      }
    }
  ]
})
