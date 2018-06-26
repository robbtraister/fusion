'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

// const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentDistRoot
} = require('../environment')

module.exports = (entry) =>
  (Object.keys(entry).length)
    ? {
      entry,
      externals,
      mode,
      module: {
        rules: [
          // {
          //   test: /\.jsx?$/i,
          //   exclude: /node_modules/,
          //   use: [
          //     babelLoader
          //   ]
          // },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              cssLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: componentDistRoot,
        library: `window.Fusion=window.Fusion||{};window.Fusion.Template`,
        libraryTarget: 'assign'
      },
      plugins: [
        new ManifestPlugin(),
        new MiniCssExtractPlugin({
          filename: '[contenthash].css'
        })
      ],
      resolve,
      target: 'web',
      watchOptions: {
        ignored: /node_modules/
      }
    }
    : null
