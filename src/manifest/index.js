'use strict'

const path = require('path')

const glob = require('glob')

const { bundleRoot: defaultBundleRoot } = require('../../env')

function getCollection (bundleRoot, collectionName, levels = 1) {
  const wildcards = '/*'.repeat(levels)
  const collectionDir = `${bundleRoot}/components/${collectionName}`

  return Object.assign(
    {},
    ...[
      ...glob.sync(`${collectionDir}${wildcards}.{js,jsx}`),
      ...glob.sync(`${collectionDir}${wildcards}/index.{js,jsx}`)
    ]
      .filter(filePath => !/\.test\.jsx?$/.test(filePath))
      .filter(filePath => !/[\\/]_+tests?_+[\\/]/.test(filePath))
      .map(relativePath => path.resolve(relativePath))
      .map(absolutePath => {
        const match = new RegExp(
          `${collectionDir}(${'[\\/][^\\/]+'.repeat(levels)})`
        ).exec(absolutePath)
        const group = match[1]
        const fileParts = path.parse(group.substr(1))
        const type = path.join(fileParts.dir, fileParts.name)
        return { [type]: absolutePath }
      })
  )
}

function getComponents (bundleRoot) {
  return {
    chains: getCollection(bundleRoot, 'chains'),
    features: getCollection(bundleRoot, 'features', 2),
    layouts: getCollection(bundleRoot, 'layouts'),
    'output-types': getCollection(bundleRoot, 'output-types')
  }
}

function getManifest (bundleRoot = defaultBundleRoot) {
  return {
    components: getComponents(bundleRoot)
  }
}

module.exports = getManifest

if (module === require.main) {
  console.log(JSON.stringify(getManifest(), null, 2))
}
