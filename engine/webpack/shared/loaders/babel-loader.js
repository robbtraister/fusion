'use strict'

module.exports = {
  loader: 'babel-loader',
  options: {
    babelrc: false,
    presets: [
      'env',
      'react'
    ],
    plugins: [
      'transform-decorators-legacy',
      'transform-object-rest-spread'
    ],
    comments: false
  }
}
