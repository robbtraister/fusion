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
      'transform-decorators-legacy'
    ],
    comments: false
  }
}
