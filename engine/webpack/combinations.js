'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentDistRoot
} = require('../environment')

const { components } = require('../environment/bundle')

const componentTypes = Object.keys(components).filter(ot => ot !== 'outputTypes')
const outputTypes = Object.keys(components.outputTypes)

// this should probably be in bundle, but the bundle volume is generally mapped as read-only
// so just put it in the root
const combinationSrcDir = path.resolve(__dirname, '../combinations')
childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

const config = (outputType) => {
  const combinationSrcFile = path.resolve(combinationSrcDir, `${outputType}.js`)
  fs.writeFileSync(combinationSrcFile,
    `
const unpack = require('../src/react/shared/unpack')
const Components = {}
${componentTypes.map(componentType => `Components['${componentType}'] = Components['${componentType}'] || {}`).join('\n')}
${[].concat(
    ...componentTypes.map(componentType => {
      const typedComponents = components[componentType]
      return Object.keys(typedComponents)
        .map(componentName => {
          const component = typedComponents[componentName]
          const componentOutputType = component[outputType] || component.default
          return componentOutputType
            ? `Components['${componentType}']['${componentName}'] = unpack(require('${component[componentOutputType]}'))`
            : ''
        })
    })
  ).join('\n')}
module.exports = Components
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
      path: path.resolve(componentDistRoot, 'combinations'),
      library: `window.Fusion=window.Fusion||{};window.Fusion.Components`,
      libraryTarget: 'assign'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    resolve,
    target: 'web',
    watchOptions: {
      ignored: /node_modules/
    }
  }
}

module.exports = outputTypes.length
  ? outputTypes.map(config)
  : null
