'use strict'

/*

Example:
{
  "components": {
    "chains": {
      "default-chain": {
        "type": "chain",
        "id": "default-chain",
        "outputTypes": {
          "default": {
            "outputType": "default",
            "src": "/workdir/engine/bundle/components/chains/default-chain.jsx",
            "dist": "/workdir/engine/dist/components/chains/default-chain/default.js"
          }
        }
      }
    }
  }
}

*/

const path = require('path')

const glob = require('glob')

const {
  // apiPrefix,
  componentDistRoot,
  componentSrcRoot,
  isDev
} = require('.')

const WILDCARD_LEVELS = {
  features: 2
}

const isTest = (f) => /(\/_+(tests?|snapshots?)_+\/|\.test\.js|\.snap$)/.test(f)
const isNotTest = (f) => !isTest(f)

const createComponentEntry = (src, componentType, componentName, outputType) => {
  const p = `${componentType}/${componentName}${outputType ? `/${outputType}` : ''}.js`
  return {
    outputType,
    src,
    dist: `${componentDistRoot}/${p}`
    // uri: `${apiPrefix}/dist/components/${p}`
  }
}

const getComponentType = (type, outputTypes) => {
  const wildcardLevels = WILDCARD_LEVELS[type] || 1
  const typeSrcRoot = `${componentSrcRoot}/${type}${'/*'.repeat(wildcardLevels)}`

  const componentMap = {}
  glob.sync(`${typeSrcRoot}.{hbs,js,jsx,vue}`)
    .filter(isNotTest)
    .map(fp => {
      const parts = path.parse(fp)
      const componentName = parts.dir.split('/').concat(parts.name).slice(-wildcardLevels).join('/')
      componentMap[componentName] = componentMap[componentName] || {
        type: type.replace(/s$/, ''),
        id: componentName
      }
      if (outputTypes) {
        componentMap[componentName].outputTypes = componentMap[componentName].outputTypes || {}
        componentMap[componentName].outputTypes.default = createComponentEntry(fp, type, componentName, 'default')
      } else {
        Object.assign(componentMap[componentName], createComponentEntry(fp, type, componentName))
      }
    })

  if (outputTypes) {
    const outputTypeArray = (outputTypes instanceof Array) ? outputTypes : [outputTypes]
    const outputTypeFiles = glob.sync(`${typeSrcRoot}/{${outputTypeArray.join(',')}}.{hbs,js,jsx,vue}`)
    outputTypeFiles
      .filter(isNotTest)
      .forEach(fp => {
        const parts = path.parse(fp)
        const outputType = parts.name
        const componentName = parts.dir.split('/').slice(-wildcardLevels).join('/')
        componentMap[componentName] = componentMap[componentName] || {
          type: type.replace(/s$/, ''),
          id: componentName,
          outputTypes: {}
        }
        componentMap[componentName].outputTypes[outputType] = createComponentEntry(fp, type, componentName, outputType)
      })
  }

  return componentMap
}

function getComponentManifest (type) {
  try {
    if (isDev) {
      throw new Error('only read manifest from file in production')
    }
    return require(`${componentDistRoot}/${type}/fusion.manifest.json`)
  } catch (e) {
    const outputTypes = getComponentType('output-types')

    return (type === 'output-types')
      ? outputTypes
      : getComponentType(type, Object.keys(outputTypes))
  }
}

module.exports = {
  components: {
    chains: getComponentManifest('chains'),
    features: getComponentManifest('features'),
    layouts: getComponentManifest('layouts'),
    outputTypes: getComponentManifest('output-types')
  }
}
