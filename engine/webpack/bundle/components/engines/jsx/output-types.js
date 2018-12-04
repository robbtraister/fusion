'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const combinationTemplate = require('./combinations/template')

const getEntries = require('../_shared/get-entries')('jsx')

const getComponentManifest = require('../../../manifest/components')

const { buildRoot, bundleRoot, distRoot, generatedRoot } = require('../../../../../environment')

const combinationSrcDir = path.resolve(generatedRoot, 'combinations')
childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

function writeCombinationFiles (manifest) {
  const { outputTypes, ...collections } = manifest

  return Object.values(outputTypes)
    .forEach((outputTypeManifest) => {
      const { base, type } = outputTypeManifest

      const combinationSrcPath = path.resolve(combinationSrcDir, base)

      return fs.writeFileSync(
        combinationSrcPath,
        combinationTemplate({
          bundleRoot,
          collections,
          outputType: type
        })
      )
    })
}

module.exports = (manifest) => {
  writeCombinationFiles(manifest)

  const { outputTypes } = getEntries(manifest)

  return {
    ...require('../../../../_shared'),
    ...require('./externals'),
    entry: outputTypes,
    module: {
      rules: [
        require('../../../../_shared/rules/jsx'),
        require('../../../../_shared/rules/css'),
        require('../../../../_shared/rules/sass')
      ]
    },
    output: {
      // webpack doesn't allow absolute file paths, but we need separate locations for js and css
      // so just make them relative to root
      filename: path.relative('/', `${buildRoot}/[name].jsx`),
      path: '/',
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: path.relative('/', `${distRoot}/[name].css`)
      }),
      new OnBuildWebpackPlugin(async function (stats) {
        // rewrite combination files on output-type changes in case fallbacks are modified
        writeCombinationFiles(getComponentManifest(true).components)
      })
    ],
    target: 'node'
  }
}
