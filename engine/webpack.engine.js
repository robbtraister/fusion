'use strict'

const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')

// const VENDOR_PACKAGES = []
//
// function externals (context, request, callback) {
//   if (VENDOR_PACKAGES.includes(request)) {
//     return callback(null, request)
//   }
//   callback()
// }

module.exports = {
  entry: {
    'react.js': require.resolve('./src/react/client')
  },
  // externals,
  mode: /^dev/i.test(process.env.NODE_ENV) ? 'development' : 'production',
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
