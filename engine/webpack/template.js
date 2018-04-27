'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const { isDev } = require('../src/environment')

module.exports = (entry) =>
  (Object.keys(entry).length)
    ? {
      entry,
      externals,
      mode,
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
          },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev
                }
              }
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev
                }
              },
              'sass-loader'
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: path.resolve(__dirname, '..', 'dist', 'components'),
        library: `var Fusion=Fusion||{};Fusion.Template`,
        libraryTarget: 'assign'
      },
      plugins: [
        new ManifestPlugin(),
        new MiniCssExtractPlugin({
          filename: '[contenthash].css'
        })
      ],
      resolve
    }
    : null
