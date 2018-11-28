'use strict'

const path = require('path')

module.exports = (options) => {
  const { bundleRoot, collections, outputType } = options
  const { outputTypes, ...componentCollections } = collections

  return `
window.Fusion = window.Fusion || {}
const components = window.Fusion.components = window.Fusion.components || {}
const unpack = require('${require.resolve('../../../../../../src/utils/unpack')}')
${
  Object.keys(componentCollections)
    .map((collection) =>
      `components['${collection}'] = components['${collection}'] || {}`
    )
    .join('\n')
}
${
  []
    .concat(
      ...Object.values(componentCollections)
        .map(componentCollection => {
          return Object.values(componentCollection)
            .map(({ outputTypes }) => outputTypes[outputType])
            .filter((outputType) => outputType && outputType.engine === 'jsx')
            .map((component) => {
              const { collection, src, type } = component
              const Wrapper = (collection === 'layouts') ? 'Layout' : 'Quarantine'
              return `components['${collection}']['${type}'] = Fusion.components.${Wrapper}(unpack(require('${path.join(bundleRoot, src)}')))`
            })
        })
    )
    .join('\n')}
`
}
