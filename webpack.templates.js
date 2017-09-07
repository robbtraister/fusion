'use strict'

const path = require('path')

const glob = require('glob')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')

function excludeLibs (context, request, callback) {
  if (request === 'react') {
    return callback(null, request)
  }
  callback()
}

// if consumer is not found, attempt to build without it
let resolveConsumer = {}
try {
  resolveConsumer = {
    extensions: ['.js', '.jsx'],
    alias: {
      'consumer': require.resolve('./components/consumer.jsx')
    }
  }
} catch (e) {}

function config (Type) {
  const types = `${Type.toLowerCase()}s`

  const entries = {}
  glob.sync(`./${types}/**/*.{jsx,vue}`)
    .forEach(f => { entries[path.parse(f).base] = f })

  return Object.keys(entries).length
    ? {
      entry: entries,
      externals: excludeLibs,
      output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'dist', types)
        // libraryTarget: 'commonjs2'
      },
      resolve: resolveConsumer,
      module: {
        loaders: [
          {
            test: /\.jsx?$/i,
            exclude: /node_modules/,
            loader: ['babel-loader']
          },
          {
            test: /\.vue$/i,
            loader: ['vue-loader']
          }
        ]
      },
      plugins: [
        new webpack.BannerPlugin({
          banner: `var module=module||{};var ${Type}=module.exports=`,
          raw: true,
          entryOnly: true,
          test: /\.(jsx?|vue)$/i
        }),
        new CopyWebpackPlugin([
          {from: `./${types}/**/*.hbs`, to: '[name].[ext]'}
        ]),
        new webpack.optimize.UglifyJsPlugin({
          test: /\.jsx?$/
        })
      ]
    }
    : null
}

module.exports = [
  config('Layout'),
  config('Template')
].filter(c => !!c)
