'use strict'

const path = require('path')

const glob = require('glob')
const webpack = require('webpack')

// const CopyWebpackPlugin = require('copy-webpack-plugin')

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
  glob.sync(`./${types}/**/*.{hbs,jsx,vue}`)
    .forEach(f => { entries[path.parse(f).base] = f })

  const plugins = [
    new webpack.BannerPlugin({
      banner: `var module=module||{};var ${Type}=module.exports=`,
      raw: true,
      entryOnly: true,
      test: /\.(hbs|jsx?|vue)$/i
    })
    // new CopyWebpackPlugin([
    //   {from: `./${types}/**/*.hbs`, to: '[name].[ext]'}
    // ])
  ]

  if (/^prod/i.test(process.env.NODE_ENV)) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      test: /\.(hbs|jsx?|vue)$/i
    }))
  }

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
            test: /\.hbs$/i,
            exclude: /node_modules/,
            loader: ['handlebars-loader']
          },
          {
            test: /\.jsx?$/i,
            exclude: /node_modules/,
            loader: ['babel-loader']
          },
          {
            test: /\.vue$/i,
            exclude: /node_modules/,
            loader: ['vue-loader']
          }
        ]
      },
      plugins
    }
    : null
}

module.exports = [
  config('Layout'),
  config('Template')
].filter(c => !!c)
