'use strict'

const path = require('path')

module.exports = ({ componentRoot, ext, outputTypes }) =>
  (node) => {
    function getOutputTypeFile (outputType) {
      return path.resolve(componentRoot, node.collection, node.type, `${outputType}${ext}`)
    }

    if (node && node.collection && node.type) {
      const result = [].concat(
        getOutputTypeFile(outputTypes[0]),
        path.resolve(componentRoot, node.collection, `${node.type}${ext}`),
        outputTypes.slice(1).map(getOutputTypeFile)
      )
        .find((componentPath) => {
          try {
            return require.resolve(componentPath)
          } catch (err) {
          }
        })

      if (!result) {
        // we don't need a full stacktrace to know a file could not be found
        console.error(`Could not find component file for [${node.collection}/${node.type}]`)
      }

      return result
    }
  }
