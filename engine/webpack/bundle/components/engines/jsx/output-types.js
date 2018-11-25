'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const combinationTemplate = require('./combinations/template')

module.exports = (env) => {
  const { buildRoot, bundleRoot, generatedRoot } = env

  const getComponentManifest = require('./get-manifest')(env)

  const combinationSrcDir = path.resolve(generatedRoot, 'combinations')
  childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

  function writeCombinationFiles (manifest) {
    const { outputTypes, ...collections } = manifest

    return Object.values(outputTypes)
      .forEach((outputTypeManifest) => {
        const { outputType } = outputTypeManifest

        const combinationSrcPath = path.resolve(combinationSrcDir, outputType)

        return fs.writeFileSync(
          combinationSrcPath,
          combinationTemplate({
            bundleRoot,
            collections,
            outputType
          })
        )
      })
  }

  const componentManifest = getComponentManifest()
  writeCombinationFiles(componentManifest)

  return function getOutputTypeConfigs (componentManifest) {
    const { outputTypes } = componentManifest

    const outputTypeEntry = Object.assign(
      {},
      ...Object.values(outputTypes)
        .map((outputType) => outputType.src)
        .map((relativePath) => {
          const relativeParts = path.parse(relativePath)
          return { [path.join(relativeParts.dir, relativeParts.name)]: path.resolve(bundleRoot, relativePath) }
        })
    )

    return {
      ...require('../../../../_shared')(env),
      ...require('./externals')(env),
      entry: outputTypeEntry,
      module: {
        rules: [
          require('../../../../_shared/rules/jsx')(env),
          require('../../../../_shared/rules/css')(env),
          require('../../../../_shared/rules/sass')(env)
        ]
      },
      output: {
        filename: '[name].jsx',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        }),
        new OnBuildWebpackPlugin(async function (stats) {
          // rewrite combination files on output-type changes in case fallbacks are modified
          writeCombinationFiles(getComponentManifest())
        })
      ],
      target: 'node'
    }
  }
}
