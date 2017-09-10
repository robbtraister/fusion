'use strict'

const path = require('path')

const glob = require('glob')
const webpack = require('webpack')

// const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const PRODUCTION = /^prod/i.test(process.env.NODE_ENV)

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

  const cssExtractor = new ExtractTextPlugin('[name].[contenthash].css')

  return Object.keys(entries).length
    ? {
      entry: entries,
      externals: excludeLibs,
      output: {
        filename: `[name]`,
        path: path.resolve(__dirname, 'dist', types)
        // libraryTarget: 'commonjs2'
      },
      resolve: resolveConsumer,
      module: {
        rules: [
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
          },
          {
            test: /\.css$/,
            loader: cssExtractor.extract({
              fallback: 'style-loader',
              use: {
                loader: 'css-loader',
                options: {
                  minimize: PRODUCTION
                }
              }
            })
          },
          {
            test: /\.s[ac]ss$/,
            loader: cssExtractor.extract({
              fallback: 'style-loader',
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                    minimize: PRODUCTION
                  }
                },
                {
                  loader: 'sass-loader'
                }
              ]
            })
          }
        ]
      },
      plugins: [
        new ManifestPlugin(),
        new webpack.BannerPlugin({
          banner: `var module=module||{};var ${Type}=module.exports=`,
          raw: true,
          entryOnly: true,
          test: /\.(hbs|jsx?|vue)$/i
        }),
        cssExtractor
        // new CopyWebpackPlugin([
        //   {from: `./${types}/**/*.hbs`, to: '[name].[ext]'}
        // ])
      ].concat(
        PRODUCTION
          ? new webpack.optimize.UglifyJsPlugin({
            test: /\.(hbs|jsx?|vue)$/i
          })
          : []
      )
    }
    : null
}

module.exports = [
  config('Layout'),
  config('Template')
].filter(c => !!c)
