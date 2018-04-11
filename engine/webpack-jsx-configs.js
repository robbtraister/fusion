'use strict'

const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

const { isDev } = require('./src/environment')

const VENDOR_PACKAGES = ['react']

function externals (context, request, callback) {
  if (VENDOR_PACKAGES.includes(request)) {
    return callback(null, request)
  }
  callback()
}

// if consumer is not found, attempt to build without it
let alias = {}
try {
  alias = {
    'consumer': require.resolve('./src/react/shared/consumer.js')
  }
} catch (e) {}

const optimization = (isDev)
  ? {}
  : {
    minimizer: [new UglifyWebpackPlugin({
      test: /\.jsx?$/i
    })]
  }

module.exports = (entry) =>
  (Object.keys(entry).length)
    ? {
      entry,
      externals,
      mode: (isDev) ? 'development' : 'production',
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
      optimization,
      output: {
        filename: `[name]`,
        path: path.resolve(__dirname, 'dist', 'components'),
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new ManifestPlugin()
      ],
      resolve: {
        alias,
        extensions: ['.js', '.jsx']
      }
    }
    : null
