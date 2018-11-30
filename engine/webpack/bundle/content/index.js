'use strict'

const path = require('path')

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
        .map((item) => {
          const srcParts = path.parse(item.src)
          return { [path.join(srcParts.dir, srcParts.name)]: path.resolve(bundleRoot, item.src) }
        })
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
          require('../../_shared/rules/js'),
          require('../../_shared/rules/yml')
        ]
      },
      output: {
        filename: '[name].js',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
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
