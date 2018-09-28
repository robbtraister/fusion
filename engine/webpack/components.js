'use strict'

const childProcess = require('child_process')
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
  bundleRoot,
  bundleDistRoot,
  componentDistRoot,
  isDev,
  minify
} = require('../environment')

const { components } = require('../manifest')

const loadConfigs = require('../src/configs')

const {
  writeFile
} = require('../src/utils/promises')

module.exports = Object.keys(components)
  .filter(collection => collection !== 'outputTypes')
  .map((collection) => {
    const entry = {}

    Object.keys(components[collection])
      .forEach((componentType) => {
        const component = components[collection][componentType]
        Object.keys(component.outputTypes)
          .forEach((outputType) => {
            entry[`${componentType}/${outputType}`] = path.join(bundleRoot, component.outputTypes[outputType].src)
          })
      })

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
        plugins: [
          new MiniCssExtractPlugin({
            filename: '[name].css'
          }),
          new ManifestPlugin({ fileName: 'webpack.manifest.json' }),
          new OnBuildWebpackPlugin(function (stats) {
            writeFile(`${componentDistRoot}/${collection}/fusion.configs.json`, JSON.stringify(loadConfigs(collection), null, 2))
            if (isDev) {
              // manifest generation requires babel-register, which is very expensive
              // run it in a separate process to prevent ALL modules from being transpiled
              childProcess.exec('npm run generate:manifest')
              childProcess.exec(`rm -rf '${path.resolve(bundleDistRoot, 'page')}'`)
              childProcess.exec(`rm -rf '${path.resolve(bundleDistRoot, 'styles')}'`)
              childProcess.exec(`rm -rf '${path.resolve(bundleDistRoot, 'template')}'`)
            }
          })
        ],
        resolve,
        // in dev mode, compiled components must be usable without babel
        target: (minify) ? 'node' : 'web',
        watchOptions: {
          ignored: /node_modules/
        }
      }
      : (() => {
        writeFile(`${componentDistRoot}/${collection}/fusion.configs.json`, '[]')
        return null
      })()
  })
  .filter(c => c)
