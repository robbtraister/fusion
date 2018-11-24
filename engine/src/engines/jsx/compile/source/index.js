'use strict'

const importsFactory = require('./imports')

function generateSource ({ componentRoot, outputTypes, tree }) {
  const getImports = importsFactory({
    componentRoot,
    outputTypes
  })

  const imports = getImports(tree)

  const usedCollections = Object.keys(imports)
    .filter((collection) => Object.keys(imports[collection]).length)

  return `
const identity = item => item
const Fusion = window.Fusion = window.Fusion || {}
const components = Fusion.components = Fusion.components || {}
const Layout = components.Layout || identity
const Quarantine = components.Quarantine || identity
${
  usedCollections
    .map((collection) =>
      `components['${collection}'] = components['${collection}'] || {}`
    )
    .join('\n')
}
${
  usedCollections
    .map((collection) => {
      const Wrapper = (collection === 'layouts')
        ? 'Layout'
        : 'Quarantine'
      const collectionCache = imports[collection]
      return Object.keys(collectionCache)
        .map((type) => {
          return `components['${collection}']['${type}'] = ${Wrapper}(Fusion.unpack(require('${collectionCache[type]}')))`
        })
        .join('\n')
    })
    .join('\n')
}
Fusion.tree = ${JSON.stringify(tree)}
`
}

module.exports = generateSource
