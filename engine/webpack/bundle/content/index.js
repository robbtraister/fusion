'use strict'

const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const getContentConfigs = require('./configs')

const {
  writeFile
} = require('../../../src/utils/promises')

const { buildRoot, bundleRoot, distRoot } = require('../../../environment')

module.exports = ({ content }) => {
  function getWebpackConfig (collection) {
    const collectionManifest = content[collection]

    const entry = Object.assign(
      {},
      ...Object.values(collectionManifest)
        .map((item) => ({
          [`content/${item.collection}/${item.type}`]: path.resolve(bundleRoot, item.src)
        }))
    )

    async function writeCollectionConfigs () {
      const configs = Object.values(collectionManifest)
        .map((item) => {
          return getContentConfigs[item.collection](item.type)
        })

      return Promise.all(
        [
          writeFile(
            path.resolve(distRoot, 'configs', 'content', `${collection}.json`),
            JSON.stringify(configs, null, 2)
          )
        ]
          .concat(
            configs.map((config) =>
              writeFile(
                path.resolve(distRoot, 'configs', 'content', collection, `${config.id}.json`),
                JSON.stringify(config, null, 2)
              )
            )
          )
      )
    }

    return {
      ...require('../../_shared'),
      entry,
      externals: {
        'fusion:environment': 'fusion:environment',
        'fusion:properties': 'fusion:properties'
      },
      module: {
        rules: [
          require('../../_shared/rules/js')
        ]
      },
      output: {
        filename: '[name].js',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new CopyWebpackPlugin([{
          from: `${bundleRoot}/content/${collection}/*.json`,
          to: `${buildRoot}/[name].[ext]`
        }]),
        new OnBuildWebpackPlugin(async function (stats) {
          writeCollectionConfigs()
        })
      ],
      target: 'node'
    }
  }

  return [].concat(
    getWebpackConfig('schemas'),
    getWebpackConfig('sources')
  )
}
