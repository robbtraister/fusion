'use strict'

const path = require('path')

module.exports = (options) => {
  const { bundleRoot, collections } = options
  const componentCollections = Object.keys(collections).filter(collection => collection !== 'outputTypes')

  return `
window.Fusion = window.Fusion || {}
const components = window.Fusion.components = window.Fusion.components || {}
const unpack = require('${require.resolve('../../../../../../src/utils/unpack')}')
${componentCollections.map(componentCollection => `components['${componentCollection}'] = components['${componentCollection}'] || {}`).join('\n')}
${[].concat(
    ...componentCollections.map(componentCollection => {
      const collectionTypes = collections[componentCollection]
      return Object.keys(collectionTypes)
        .map(type => {
          const componentPath = collectionTypes[type]
          return (componentCollection === 'layouts')
            ? `components['${componentCollection}']['${type}'] = Fusion.components.Layout(unpack(require('${path.join(bundleRoot, componentPath)}')))`
            : `components['${componentCollection}']['${type}'] = Fusion.components.Quarantine(unpack(require('${path.join(bundleRoot, componentPath)}')))`
        })
    })
  ).join('\n')}
`
}
