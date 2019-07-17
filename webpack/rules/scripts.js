'use strict'

module.exports = [
  {
    test: /\.m?[jt]sx?$/,
    exclude: /[\\/]node_modules[\\/]/,
    use: {
      loader: 'babel-loader',
      options: {
        ...require('../../babel.config'),
        babelrc: false
      }
    }
  }
]
