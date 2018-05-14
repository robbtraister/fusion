'use strict'

const path = require('path')

const glob = require('glob')

const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentSrcRoot,
  distRoot
} = require('../environment')

const entry = {}
const types = {}
glob.sync(`${componentSrcRoot}/!(output-types)/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => {
    const name = f.substr(componentSrcRoot.length + 1)
    const type = name.split('/').shift()
    types[type] = true
    const parts = path.parse(name)
    entry[path.join(parts.dir, parts.name)] = f
  })

module.exports = (Object.keys(entry).length)
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
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new ManifestPlugin()
    ],
    resolve
  }
  : null
