'use strict'

const path = require('path')

const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

// const VENDOR_PACKAGES = []
//
// function externals (context, request, callback) {
//   if (VENDOR_PACKAGES.includes(request)) {
//     return callback(null, request)
//   }
//   callback()
// }

// const minimizer = (process.env.NODE_ENV === 'production')
//   ? [new UglifyWebpackPlugin({
//     test: /\.jsx?$/i
//   })]
//   : []

const minimizer = [new UglifyWebpackPlugin({
  test: /\.jsx?$/i
})]

module.exports = {
  entry: {
    'react.js': require.resolve('./src/react/client')
  },
  // externals,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        use: [
          {
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
        ]
      }
    ]
  },
  optimization: {
    minimizer
  },
  output: {
    filename: `[name]`,
    path: path.resolve(__dirname, 'dist', 'engine'),
    library: 'react',
    libraryTarget: 'var'
  },
  plugins: [
    new ManifestPlugin()
  ],
  target: 'web'
}
