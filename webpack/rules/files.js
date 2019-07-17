'use strict'

const { fileLimit, isProd } = require('../../env')

module.exports = [
  {
    test: /\.(eot|gif|jpe?g|otf|png|svg|ttf|woff2?)$/,
    use: {
      loader: 'url-loader',
      options: {
        fallback: 'file-loader',
        limit: fileLimit,
        name: isProd ? 'assets/[hash].[ext]' : 'assets/[path][name].[ext]',
        publicPath: '/dist/'
      }
    }
  },
  {
    test: /\.ya?ml$/,
    use: ['json-loader', 'yaml-loader']
  }
]
