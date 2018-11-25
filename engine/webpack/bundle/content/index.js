'use strict'

const path = require('path')

const glob = require('glob')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const configFactory = require('./configs')

const {
  writeFile
} = require('../../../src/utils/promises')

module.exports = (env) => {
  const { buildRoot, bundleRoot, distRoot } = env

  const getContentConfigs = configFactory(env)

  function getWebpackConfig (collection) {
    const entry = Object.assign(
      {},
      ...glob.sync(`${bundleRoot}/content/${collection}/*.{js,ts}`)
        .map((filePath) => ({
          [path.relative(bundleRoot, filePath)]: filePath
        }))
    )

    const jsonGlob = `${bundleRoot}/content/${collection}/*.json`

    const getCollectionConfigs = getContentConfigs[collection]
    async function writeCollectionConfigs () {
      const configs = Object.keys(entry)
        .concat(glob.sync(jsonGlob))
        .map((collectionFile) => path.parse(collectionFile).name)
        .map(getCollectionConfigs)

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
      ...require('../../_shared')(env),
      entry,
      externals: {
        'fusion:environment': 'fusion:environment',
        'fusion:properties': 'fusion:properties'
      },
      module: {
        rules: [
          require('../../_shared/rules/js')(env)
        ]
      },
      output: {
        filename: '[name]',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new CopyWebpackPlugin([{
          from: jsonGlob,
          to: `${buildRoot}/[name].[ext]`
        }]),
        new OnBuildWebpackPlugin(async function (stats) {
          writeCollectionConfigs()
        })
      ],
      target: 'node'
    }
  }

  return [
    getWebpackConfig('schemas'),
    getWebpackConfig('sources')
  ]
}
