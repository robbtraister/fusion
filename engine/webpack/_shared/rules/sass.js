'use strict'

const mockRequire = require('mock-require')
// sass-loader uses node-sass
// node-sass requires native compilation, which we can't guarantee will work in lambda
// so replace it with an all-js alternative
mockRequire('node-sass', 'sass')
mockRequire('node-sass/package.json', { version: 4 })

module.exports = {
  test: /\.s[ac]ss$/,
  use: require('./css').use.concat('sass-loader')
}
