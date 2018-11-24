'use strict'

const path = require('path')

module.exports = ({ bundleRoot, components, outputType }) => {
  const componentCollections = Object.keys(components).filter(collection => collection !== 'outputTypes')

  return `
window.Fusion = window.Fusion || {}
const components = window.Fusion.components = window.Fusion.components || {}
const unpack = require('${require.resolve('../src/utils/unpack')}')
${componentCollections.map(componentCollection => `components['${componentCollection}'] = components['${componentCollection}'] || {}`).join('\n')}
${[].concat(
    ...componentCollections.map(componentCollection => {
      const collectionTypes = components[componentCollection]
      return Object.values(collectionTypes)
        .map(component => {
          const componentOutputType = component.outputTypes[outputType] || component.outputTypes.default
          return (!componentOutputType)
            ? ''
            : (componentCollection === 'layouts')
              ? `components['${componentCollection}']['${component.type}'] = Fusion.components.Layout(unpack(require('${path.join(bundleRoot, componentOutputType.src)}')))`
              : `components['${componentCollection}']['${component.type}'] = Fusion.components.Quarantine(unpack(require('${path.join(bundleRoot, componentOutputType.src)}')))`
        })
    })
  ).join('\n')}
`
}
