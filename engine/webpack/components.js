'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals').node
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  bundleDistRoot,
  componentDistRoot,
  isDev,
  minify
} = require('../environment')

const { components } = require('../environment/manifest')

const loadConfigs = require('../src/configs')

module.exports = Object.keys(components)
  .filter(collection => collection !== 'outputTypes')
  .map((collection) => {
    const entry = {}

    Object.keys(components[collection])
      .forEach((componentType) => {
        const component = components[collection][componentType]
        Object.keys(component.outputTypes)
          .forEach((outputType) => {
            entry[`${componentType}/${outputType}`] = component.outputTypes[outputType].src
          })
      })

    const plugins = [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new ManifestPlugin({fileName: 'webpack.manifest.json'}),
      new OnBuildWebpackPlugin(function (stats) {
        childProcess.exec(`mkdir -p '${componentDistRoot}/${collection}'`, () => {
          fs.writeFile(`${componentDistRoot}/${collection}/fusion.manifest.json`, JSON.stringify(components[collection], null, 2), () => {
            fs.writeFile(`${componentDistRoot}/${collection}/fusion.configs.json`, JSON.stringify(loadConfigs(collection), null, 2), () => {})
          })
        })
      })
    ]

    if (isDev) {
      plugins.push(
        new OnBuildWebpackPlugin(function (stats) {
          childProcess.exec(`rm -rf '${path.resolve(bundleDistRoot, 'page')}'`)
          childProcess.exec(`rm -rf '${path.resolve(bundleDistRoot, 'styles')}'`)
          childProcess.exec(`rm -rf '${path.resolve(bundleDistRoot, 'template')}'`)
        })
      )
    }

    return (Object.keys(entry).length)
      ? {
        devtool: false,
        entry,
        externals,
        mode,
        module: {
          rules: [
            {
              test: /\.[jt]sx?$/i,
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
          path: path.resolve(componentDistRoot, collection),
          libraryTarget: 'commonjs2'
        },
        plugins,
        resolve,
        // in dev mode, compiled components must be usable without babel
        target: (minify) ? 'node' : 'web',
        watchOptions: {
          ignored: /node_modules/
        }
      }
      : (() => {
        // if the type is empty, still create an empty config/manifest file
        childProcess.exec(`mkdir -p '${componentDistRoot}/${collection}'`, () => {
          fs.writeFile(`${componentDistRoot}/${collection}/fusion.manifest.json`, '{}', () => {
            fs.writeFile(`${componentDistRoot}/${collection}/fusion.configs.json`, '[]', () => {})
          })
        })

        return null
      })()
  })
  .filter(c => c)
