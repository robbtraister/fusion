'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const combinationTemplate = require('./combination-template')
const {
  exec
} = require('../../../../../src/utils/promises')

module.exports = (env) => {
  const { buildRoot, bundleRoot, distRoot, generatedRoot, projectRoot } = env

  const combinationSrcDir = path.resolve(generatedRoot, 'combinations')
  childProcess.execSync(`mkdir -p '${combinationSrcDir}'`)

  function getComponentManifest () {
    // execute this as a separate process because it needs inline babel
    const { outputTypes, ...collections } = JSON.parse(
      childProcess.execSync(`node ${path.resolve(projectRoot, 'manifest', 'components')}`)
        .toString()
    ).components

    return {
      outputTypes: Object.values(outputTypes)
        .filter((manifest) => /^\.jsx$/.test(manifest.ext)),
      ...collections
    }
  }

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
  const { outputTypes, ...collections } = componentManifest

  function getCombinationFile (outputType) {
    return path.resolve(combinationSrcDir, outputType)
  }

  function getCollectionConfigs () {
    const entry = Object.assign(
      {},
      ...Object.values(outputTypes)
        .map((manifest) => manifest.outputType)
        .map((outputType) =>
          Object.assign(
            {},
            ...Object.values(collections)
              .map(collection =>
                Object.assign(
                  {},
                  ...Object.values(collection)
                    .map(component => component[outputType])
                    .filter(componentPath => componentPath)
                    .map((relativePath) => ({
                      [relativePath]: path.resolve(bundleRoot, relativePath)
                    }))
                )
              )
          )
        )
    )

    return {
      ...require('../../../../_shared')(env),
      ...require('./externals')(env),
      entry,
      module: {
        rules: [
          require('../../../../_shared/rules/jsx')(env),
          {
            test: /\.s?[ac]ss$/,
            use: [
              {
                loader: 'ignore-loader'
              }
            ]
          }
        ]
      },
      output: {
        filename: '[name]',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new OnBuildWebpackPlugin(async function (stats) {
          // wipe cached compilations since component code has changed
          exec(`rm -rf ${path.resolve(distRoot, 'page')}`)
          exec(`rm -rf ${path.resolve(distRoot, 'styles')}`)
          exec(`rm -rf ${path.resolve(distRoot, 'template')}`)
        })
      ],
      target: 'node'
    }
  }

  function getOutputTypeConfigs () {
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

  function getCombinationConfigs () {
    const entry = Object.assign(
      {},
      ...Object.values(outputTypes)
        .map((outputTypeManifest) => {
          const { name, outputType } = outputTypeManifest
          return {
            [name]: getCombinationFile(outputType)
          }
        })
    )

    return Object.keys(entry).length
      ? {
        ...require('../../../../_shared')(env),
        ...require('./externals')(env),
        entry,
        module: {
          rules: [
            require('../../../../_shared/rules/jsx')(env),
            require('../../../../_shared/rules/css')(env),
            require('../../../../_shared/rules/sass')(env)
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

  return [].concat(
    getOutputTypeConfigs(),
    getCollectionConfigs(),
    getCombinationConfigs()
  )
}
