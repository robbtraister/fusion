'use strict'

const path = require('path')

const OnBuildWebpackPlugin = require('on-build-webpack')

const {
  exec
} = require('../../../../../src/utils/promises')

module.exports = (env) => {
  const { buildRoot, bundleRoot, distRoot } = env

  return function getCollectionConfigs (componentManifest) {
    const { outputTypes, ...collections } = componentManifest

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
}
