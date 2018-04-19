'use strict'

const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')

const { isDev } = require('./src/environment')

const optimization = require('./webpack/optimization')

module.exports = {
  entry: {
    react: require.resolve('./src/react/client')
  },
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
    filename: `[name].js`,
    path: path.resolve(__dirname, 'dist', 'engine'),
    library: 'react',
    libraryTarget: 'var'
  },
  plugins: [
    new ManifestPlugin()
  ],
  target: 'web'
}
