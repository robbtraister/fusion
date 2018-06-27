'use strict'

const childProcess = require('child_process')
const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')
const WrapperPlugin = require('wrapper-webpack-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const components = require('./shared/components')

const {
  componentDistRoot,
  distRoot,
  isDev
} = require('../environment')

module.exports = Object.keys(components).map((type) => {
  const entry = {}

  Object.keys(components[type])
    .forEach((componentName) => {
      const component = components[type][componentName]
      Object.keys(component)
        .forEach((outputType) => {
          entry[`${componentName}/${outputType}`] = component[outputType]
        })
    })

  const plugins = [
    new WrapperPlugin({
      header: 'var module=module||{};module.exports=',
      footer (fileName) {
        const componentName = fileName.replace(/\.js$/, '').split('/').slice(0, type === 'features' ? 2 : 1).join('/')
        return `if(typeof window!=='undefined'&&window.Fusion&&window.Fusion.isAdmin){window.Fusion.Components=window.Fusion.Components||{};window.Fusion.Components.${type}=window.Fusion.Components.${type}||{};window.Fusion.Components.${type}['${componentName}']=module.exports}`
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new ManifestPlugin({fileName: 'manifest.json'})
  ]

  if (isDev) {
    plugins.push(
      new OnBuildWebpackPlugin(function (stats) {
        childProcess.execSync(`rm -rf '${path.resolve(distRoot, 'page')}'`)
        childProcess.execSync(`rm -rf '${path.resolve(distRoot, 'template')}'`)
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
        path: path.resolve(componentDistRoot, type)
      },
      plugins,
      resolve,
      target: 'web',
      watchOptions: {
        ignored: /node_modules/
      }
    }
    : null
})
