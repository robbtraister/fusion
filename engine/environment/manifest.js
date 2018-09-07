'use strict'

/*

Example:
{
  "components": {
    "chains": {
      "default-chain": {
        "collection": "chains",
        "type": "default-chain",
        "outputTypes": {
          "default": {
            "collection": "chains",
            "type": "default-chain",
            "outputType": "default",
            "src": "/workdir/engine/bundle/src/components/chains/default-chain.jsx",
            "dist": "/workdir/engine/bundle/dist/components/chains/default-chain/default.js"
            "css": "/workdir/engine/bundle/dist/components/chains/default-chain/default.css"
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
  componentGeneratedRoot,
  componentSrcRoot,
  isDev
} = require('.')

const WILDCARD_LEVELS = {
  features: 2
}

const isTest = (f) => /(\/_+(tests?|snapshots?)_+\/|\.test\.js|\.snap$)/.test(f)
const isNotTest = (f) => !isTest(f)

const createComponentEntry = (src, componentCollection, componentType, outputType) => {
  const p = `${componentCollection}/${componentType}${outputType ? `/${outputType}` : ''}.js`
  return Object.assign(
    (outputType)
      ? {outputType}
      : {},
    {
      collection: componentCollection,
      type: componentType,
      src,
      dist: `${componentDistRoot}/${p}`,
      css: `${componentDistRoot}/${p}`.replace(/\.js$/, '.css')
      // uri: `${apiPrefix}/dist/components/${p}`
    }
  )
}

const getComponentCollection = (collection, outputTypes) => {
  const wildcardLevels = WILDCARD_LEVELS[collection] || 1
  const typeSrcRoot = `${componentSrcRoot}/${collection}${'/*'.repeat(wildcardLevels)}`

  const componentMap = {}
  glob.sync(`${typeSrcRoot}.{hbs,js,jsx,vue}`)
    .filter(isNotTest)
    .map(fp => {
      const parts = path.parse(fp)
      const componentType = parts.dir.split('/').concat(parts.name).slice(-wildcardLevels).join('/')
      componentMap[componentType] = componentMap[componentType] || {
        collection,
        type: componentType
      }
      if (outputTypes) {
        componentMap[componentType].outputTypes = componentMap[componentType].outputTypes || {}
        componentMap[componentType].outputTypes.default = createComponentEntry(fp, collection, componentType, 'default')
      } else {
        Object.assign(componentMap[componentType], createComponentEntry(fp, collection, componentType))
      }
    })

  if (outputTypes) {
    const outputTypeArray = (outputTypes instanceof Array) ? outputTypes : [outputTypes]
    const outputTypeFiles = glob.sync(`${typeSrcRoot}/{${outputTypeArray.join(',')},}.{hbs,js,jsx,vue}`)
    outputTypeFiles
      .filter(isNotTest)
      .forEach(fp => {
        const parts = path.parse(fp)
        const outputType = parts.name
        const componentType = parts.dir.split('/').slice(-wildcardLevels).join('/')
        componentMap[componentType] = componentMap[componentType] || {
          collection,
          type: componentType,
          outputTypes: {}
        }
        componentMap[componentType].outputTypes[outputType] = createComponentEntry(fp, collection, componentType, outputType)
      })
  }

  return Object.assign(
    {},
    ...Object.keys(componentMap)
      .sort()
      .map(k => ({[k]: componentMap[k]}))
  )
}

function getComponentManifest (collection) {
  try {
    if (isDev) {
      throw new Error('only read manifest from file in production')
    }
    return require(`${componentGeneratedRoot}/${collection}/fusion.manifest.json`)
  } catch (e) {
    const outputTypes = getComponentCollection('output-types')

    return (collection === 'output-types')
      ? outputTypes
      : getComponentCollection(collection, Object.keys(outputTypes))
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
