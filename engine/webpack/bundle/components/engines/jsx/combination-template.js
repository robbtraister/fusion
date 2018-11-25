'use strict'

const path = require('path')

module.exports = (options) => {
  const { bundleRoot, collections, outputType } = options
  const componentCollections = Object.keys(collections).filter(collection => collection !== 'outputTypes')

  return `
window.Fusion = window.Fusion || {}
const components = window.Fusion.components = window.Fusion.components || {}
const unpack = require('${require.resolve('../../../../../src/utils/unpack')}')
${componentCollections.map(componentCollection => `components['${componentCollection}'] = components['${componentCollection}'] || {}`).join('\n')}
${[].concat(
    ...componentCollections.map(collection => {
      const componentCollection = collections[collection]
      return Object.keys(componentCollection)
        .filter(type => componentCollection[type][outputType])
        .map(type => {
          const componentPath = componentCollection[type][outputType]
          const Wrapper = (collection === 'layouts') ? 'Layout' : 'Quarantine'
          return `components['${collection}']['${type}'] = Fusion.components.${Wrapper}(unpack(require('${path.join(bundleRoot, componentPath)}')))`
        })
    })
  ).join('\n')}
`
}
