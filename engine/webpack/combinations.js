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
  componentDistRoot
} = require('../environment')

const { components } = require('../environment/manifest')

const componentTypes = Object.keys(components).filter(ot => ot !== 'outputTypes')
const outputTypes = Object.keys(components.outputTypes)

const combinationSrcDir = path.resolve(__dirname, '../generated/combinations')
childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

const config = (outputType) => {
  const combinationSrcFile = path.resolve(combinationSrcDir, `${outputType}.js`)
  fs.writeFileSync(combinationSrcFile,
    `
const unpack = require('../../src/utils/unpack')
const components = {}
${componentTypes.map(componentType => `components['${componentType}'] = components['${componentType}'] || {}`).join('\n')}
${[].concat(
    ...componentTypes.map(componentType => {
      const typedComponents = components[componentType]
      return Object.values(typedComponents)
        .map(component => {
          const componentOutputType = component.outputTypes[outputType] || component.outputTypes.default
          return componentOutputType
            ? `components['${component.type}']['${component.id}'] = unpack(require('${componentOutputType.src}'))`
            : ''
        })
    })
  ).join('\n')}
module.exports = components
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
      library: `window.Fusion=window.Fusion||{};window.Fusion.components`,
      libraryTarget: 'assign'
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
