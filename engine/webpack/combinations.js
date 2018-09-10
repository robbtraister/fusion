'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const target = 'web'

const externals = require('./shared/externals')[target]
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  bundleGeneratedRoot,
  componentDistRoot
} = require('../environment')

const { components } = require('../manifest')

const componentCollections = Object.keys(components).filter(collection => collection !== 'outputTypes')
const outputTypes = Object.keys(components.outputTypes)

const combinationSrcDir = path.resolve(bundleGeneratedRoot, 'combinations')
childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

const config = (outputType) => {
  const combinationSrcFile = path.resolve(combinationSrcDir, `${outputType}.js`)
  fs.writeFileSync(combinationSrcFile,
    `
window.Fusion = window.Fusion || {}
const components = window.Fusion.components = window.Fusion.components || {}
const unpack = require('${require.resolve('../src/utils/unpack')}')
${componentCollections.map(componentCollection => `components['${componentCollection}'] = components['${componentCollection}'] || {}`).join('\n')}
${[].concat(
    ...componentCollections.map(componentCollection => {
      const collectionTypes = components[componentCollection]
      return Object.values(collectionTypes)
        .map(component => {
          const componentOutputType = component.outputTypes[outputType] || component.outputTypes.default
          return (!componentOutputType)
            ? ''
            : (componentCollection === 'layouts')
              ? `components['${componentCollection}']['${component.type}'] = Fusion.components.Layout(unpack(require('${componentOutputType.src}')))`
              : `components['${componentCollection}']['${component.type}'] = unpack(require('${componentOutputType.src}'))`
        })
    })
  ).join('\n')}
`
  )

  return {
    devtool: false,
    entry: {
      [outputType]: combinationSrcFile
    },
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
      path: path.resolve(componentDistRoot, 'combinations')
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    resolve,
    target,
    watchOptions: {
      ignored: /node_modules/
    }
  }
}

module.exports = outputTypes.length
  ? outputTypes.map(config)
  : null
