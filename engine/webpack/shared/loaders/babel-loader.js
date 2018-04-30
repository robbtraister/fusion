'use strict'

module.exports = {
  loader: 'babel-loader',
  options: {
    babelrc: false,
    presets: [
      'es2015',
      'react'
    ],
    plugins: [
      'transform-decorators-legacy'
    ],
    comments: false
  }
}
