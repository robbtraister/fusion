'use strict'

const path = require('path')

const { bundleRoot } = require('../../../../../environment')

const getItemEntry = (item) => ({
  [item.entry]: path.join(bundleRoot, item.src)
})

module.exports = (engine) => {
  const isEngine = (outputType) => outputType.engine === engine

  function getOutputTypeEntry (outputTypes) {
    return Object.assign(
      {},
      ...Object.values(outputTypes)
        .filter(isEngine)
        .map(getItemEntry)
    )
  }

  function getCollectionEntry (collection) {
    return Object.assign(
      {},
      ...Object.values(collection)
        .map(({ outputTypes }) => getOutputTypeEntry(outputTypes))
    )
  }

  return (manifest) => {
    const { outputTypes, ...collections } = manifest

    return Object.assign(
      {
        outputTypes: getOutputTypeEntry(outputTypes)
      },
      ...Object.keys(collections)
        .map(collection => {
          return {
            [collection]: getCollectionEntry(collections[collection])
          }
        })
    )
  }
}
