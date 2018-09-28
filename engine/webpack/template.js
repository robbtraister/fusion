'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const ignoreLoader = require('./shared/loaders/ignore-loader')

const externals = require('./shared/externals').web
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentDistRoot,
  minify
} = require('../environment')

module.exports = (scriptSourceFile, stylesSourceFile) =>
  [
    {
      entry: {
        script: scriptSourceFile
      },
      externals,
      mode,
      module: {
        // in production, we will use the original source files and babel everything
        // in local development, we just concatenate pre-compiled files
        // this gives a good balance of fast reload in dev and slim payload in prod
        rules: (minify)
          ? [
            {
              test: /\.[jt]sx?$/i,
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
          : []
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: componentDistRoot,
        library: `window.Fusion=window.Fusion||{};window.Fusion.Template`,
        libraryTarget: 'assign'
      },
      resolve,
      target: 'web',
      watchOptions: {
        ignored: /node_modules/
      }
    },
    {
      entry: {
        styles: stylesSourceFile
      },
      externals,
      mode,
      module: {
        rules: [
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
        path: componentDistRoot
      },
      plugins: [
        new ManifestPlugin({ fileName: 'styles.manifest.json' }),
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
  ]
