'use strict'

const getRenderables = require('../../utils/renderables')

const fileFactory = require('../../../_shared/loaders/file-finder')

module.exports = ({ componentRoot, outputTypes }) => {
  const getComponentFile = fileFactory({
    componentRoot,
    ext: '.jsx',
    outputTypes
  })

  return function getImports (tree) {
    const imports = {}

    getRenderables(tree)
      .forEach(({ collection, type }) => {
        imports[collection] = imports[collection] || {}
        if (!imports[collection][type]) {
          const componentFile = getComponentFile({ collection, type })
          if (componentFile) {
            imports[collection][type] = componentFile
          }
        }
      })

    return imports
  }
}