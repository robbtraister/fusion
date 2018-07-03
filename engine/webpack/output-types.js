'use strict'

const childProcess = require('child_process')
const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const ignoreLoader = require('./shared/loaders/ignore-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentDistRoot
} = require('../environment')

const { components } = require('../environment/bundle')

const entry = Object.assign(
  ...Object.keys(components.outputTypes)
    .map(key => components.outputTypes[key])
    .map(outputType => ({[outputType.name]: outputType.src}))
)

// Compile twice.
// First pass will extract css into a separate file suitable for references
//  (e.g., /pb/dist/components/output-types/amp.css).
// Second pass will embed css into output-type script for direct access.
// Direct access makes sense since output-types are only accessed on the server.
// We wouldn't compile excess information into client scripts.
module.exports = (Object.keys(entry).length)
  ? [
    {
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
        filename: 'junk/[name].no-css.js',
        path: componentDistRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'output-types/[name].css'
        }),
        // we don't actually need this js, so delete it
        new OnBuildWebpackPlugin(function (stats) {
          childProcess.execSync(`rm -rf ${path.resolve(componentDistRoot, 'junk')}`)
        })
      ],
      resolve
    },
    {
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
            test: /\.s?[ac]ss$/,
            use: [
              ignoreLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: path.resolve(componentDistRoot, 'output-types'),
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new ManifestPlugin({fileName: 'manifest.json'})
      ],
      resolve,
      target: 'node',
      watchOptions: {
        ignored: /node_modules/
      }
    }
  ]
  : null
