'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const template = require('./template')

module.exports = (env) => {
  const {
    bundleRoot,
    distRoot,
    generatedRoot,
    projectRoot
  } = env

  const combinationSrcDir = path.resolve(generatedRoot, 'combinations')
  childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

  // execute this as a separate process because it needs inline babel
  const { components } = JSON.parse(
    childProcess.execSync(`node ${path.resolve(projectRoot, 'manifest', 'components')}`)
      .toString()
  )

  const { chains, features, layouts, outputTypes } = components

  function getCombinationEntry (outputTypeManifest) {
    const { name, outputType } = outputTypeManifest

    const combinationSrcPath = path.resolve(combinationSrcDir, outputType)

    fs.writeFileSync(
      combinationSrcPath,
      template({
        bundleRoot,
        collections: {
          chains,
          features,
          layouts
        },
        outputType
      })
    )

    return {
      [name]: combinationSrcPath
    }
  }

  const entry = Object.assign(
    {},
    ...Object.values(outputTypes)
      .filter((manifest) => /^\.jsx$/.test(manifest.ext))
      .map(getCombinationEntry)
  )

  return Object.keys(entry).length
    ? {
      ...require('../../../../../_shared')(env),
      ...require('../externals')(env),
      entry,
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
    : null
}
