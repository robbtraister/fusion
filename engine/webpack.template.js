'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const externals = require('./webpack/externals')
const mode = require('./webpack/mode')
const optimization = require('./webpack/optimization')
const resolve = require('./webpack/resolve')
const rules = require('./webpack/rules')

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
        path: path.resolve(__dirname, 'dist', 'components'),
        library: `window.Fusion=window.Fusion||{};Fusion.Template`,
        libraryTarget: 'assign'
      },
      plugins: [
        new ManifestPlugin(),
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css'
        })
      ],
      resolve
    }
    : null
