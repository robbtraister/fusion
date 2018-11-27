'use strict'

const importsFactory = require('./imports')

const getTree = require('../../../_shared/rendering-to-tree')

const {
  contextPath,
  deployment
} = require('../../../../../environment')

function generateSource ({ componentRoot, outputTypes, props }) {
  const tree = getTree(props)

  const getImports = importsFactory({
    componentRoot,
    outputTypes
  })

  const imports = getImports(tree)

  const usedCollections = Object.keys(imports)
    .filter((collection) => Object.keys(imports[collection]).length)

  return `
const identity = (item) => item
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
Fusion.contextPath = '${contextPath}'
Fusion.deployment = '${deployment}'
Fusion.outputType = '${outputTypes[0]}'
Fusion.template = '${props.type}/${props.id}'
Fusion.layout = ${tree.type ? `'${tree.type}'` : 'null'}
Fusion.tree = ${JSON.stringify(tree)}
`
}

module.exports = generateSource
