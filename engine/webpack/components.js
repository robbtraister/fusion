'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const { isDev } = require('../src/environment')

const alias = require('./alias')
const externals = require('./externals')
const optimization = require('./optimization')

const cssExtractor = new MiniCssExtractPlugin({filename: '[name].[contenthash].css'})

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
          },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader'
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'sass-loader'
            ]
          }
        ]
      },
      optimization,
      plugins: [
        new ManifestPlugin(),
        cssExtractor
      ],
      resolve: {
        alias,
        extensions: ['.js', '.jsx']
      }
    }
    : null
