'use strict'

const path = require('path')

const glob = require('glob')

module.exports = ({ bundleRoot, ext }) => {
  const outputTypeFiles = glob.sync(`${bundleRoot}/components/output-types/*${ext}`)
  const outputTypes = outputTypeFiles.map((outputTypeFiles) => path.parse(outputTypeFiles).name)

  function getEntries (filePaths) {
    return Object.assign(
      {},
      ...filePaths
        .map((filePath) => ({
          [path.relative(bundleRoot, filePath)]: filePath
        }))
    )
  }

  function getCollectionEntries (root) {
    return getEntries(
      [].concat(
        glob.sync(`${root}/*${ext}`),
        glob.sync(`${root}/*/{${outputTypes.join(',')},}${ext}`)
      )
    )
  }

  return {
    chains: getCollectionEntries(`${bundleRoot}/components/chains`),
    features: getCollectionEntries(`${bundleRoot}/components/features/*`),
    layouts: getCollectionEntries(`${bundleRoot}/components/layouts`),
    outputTypes: getEntries(outputTypeFiles)
  }
}
