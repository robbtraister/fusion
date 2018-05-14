'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  distRoot
} = require('../environment')

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
              babelLoader
            ]
          },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              cssLoader
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              cssLoader,
              sassLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: path.resolve(distRoot, 'components'),
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
