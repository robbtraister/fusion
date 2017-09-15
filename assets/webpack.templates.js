'use strict'

const path = require('path')

const glob = require('glob')
const webpack = require('webpack')

// const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const PRODUCTION = /^prod/i.test(process.env.NODE_ENV)

const ConcatSource = require('webpack-sources').ConcatSource
function TemplateExportPlugin (T) {
  this.T = T
}
TemplateExportPlugin.prototype.apply = function (compiler) {
  const T = this.T
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
      chunks.forEach((chunk) => {
        const cssFile = chunk.files.find(f => /\.css$/i.test(f))
        chunk.files
          .filter(f => /\.(hbs|jsx?|vue)$/i.test(f))
          .forEach(f => {
            const head = `var module=module||{};var ${T}=module.exports=\n`
            const foot = cssFile ? `\n${T}.cssFile='${cssFile}'` : ''
            compilation.assets[f] = new ConcatSource(head, compilation.assets[f], foot)
            return compilation.assets[f]
          })
      })
      callback()
    })
  })
}

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
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  'es2015',
                  'react'
                ],
                'plugins': [
                  'transform-decorators-legacy'
                ]
              }
            }
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
        new TemplateExportPlugin(Type),
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
