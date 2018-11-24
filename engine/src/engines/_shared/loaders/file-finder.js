'use strict'

const path = require('path')

module.exports = ({ componentRoot, ext, outputTypes }) =>
  (node) => {
    if (node && node.collection && node.type) {
      try {
        return require.resolve(path.resolve(componentRoot, node.collection, `${node.type}${ext}`))
      } catch (err) {
        try {
          for (var i = 0; i < outputTypes.length; i++) {
            try {
              return require.resolve(path.resolve(componentRoot, node.collection, node.type, `${outputTypes[i]}${ext}`))
            } catch (err) {}
          }
        } catch (err) {}
        // we don't need a full stacktrace to know a file could not be found
        console.error(err.message)
      }
    }
  }
