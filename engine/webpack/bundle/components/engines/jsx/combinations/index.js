'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const template = require('./template')

const { components } = require('../manifest')

module.exports = (env) => {
  const {
    bundleRoot,
    generatedRoot,
    distRoot
  } = env

  const outputTypes = Object.keys(components.outputTypes)

  const combinationSrcDir = path.resolve(generatedRoot, 'combinations')
  childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

  const config = (outputType) => {
    const combinationSrcFile = path.resolve(combinationSrcDir, `${outputType}.js`)
    fs.writeFileSync(combinationSrcFile, template({ bundleRoot, components, outputType }))

    return {
      ...require('../../../../../_shared')(env),
      ...require('../externals')(env),
      entry: {
        [outputType]: combinationSrcFile
      },
      module: {
        rules: [
          require('../../../../../_shared/rules/jsx')(env),
          require('../../../../../_shared/rules/css')(env),
          require('../../../../../_shared/rules/sass')(env)
        ]
      },
      output: {
        filename: `[name].js`,
        path: path.resolve(distRoot, 'components', 'combinations')
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        })
      ],
      target: 'web'
    }
  }

  return outputTypes.length
    ? outputTypes.map(config)
    : null
}
