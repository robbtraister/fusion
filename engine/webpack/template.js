'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')

const externals = require('./shared/externals').web
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentDistRoot,
  minify
} = require('../environment')

// in production, we will use the original source files and babel everything
// in local development, we just concatenate pre-compiled files
// this gives a good balance of fast reload in dev and slim payload in prod
const rules = (minify)
  ? [
    {
      test: /\.jsx?$/i,
      exclude: /node_modules/,
      use: [
        babelLoader
      ]
    }
  ]
  : []

rules.push({
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    cssLoader
  ]
})

module.exports = (entry) =>
  (Object.keys(entry).length)
    ? {
      entry,
      externals,
      mode,
      module: {
        rules
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: componentDistRoot,
        library: `window.Fusion=window.Fusion||{};window.Fusion.Template`,
        libraryTarget: 'assign'
      },
      plugins: [
        new ManifestPlugin({fileName: 'webpack.manifest.json'}),
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
