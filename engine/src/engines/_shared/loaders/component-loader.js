'use strict'

const unpack = require('../unpack')

const fileFactory = require('./file-finder')

module.exports = ({ componentRoot, ext, outputTypes }) => {
  const getComponentFile = fileFactory({
    componentRoot,
    ext,
    outputTypes
  })

  return function loadComponent (node) {
    try {
      const filePath = getComponentFile(node)
      if (filePath) {
        return unpack(require(filePath))
      }
    } catch (err) {
      // we don't need a full stacktrace to know a file could not be found
      console.error(err.message)
    }
  }
}
