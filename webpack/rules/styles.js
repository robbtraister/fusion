'use strict'

module.exports = [
  {
    test: /\.s?[ac]ss$/,
    use: {
      loader: 'css-loader',
      options: {
        modules: {
          mode: 'local'
        },
        sourceMap: true
      }
    }
  },
  {
    test: /\.s[ac]ss$/,
    use: {
      loader: 'sass-loader',
      options: {
        implementation: require('sass')
      }
    }
  }
]
