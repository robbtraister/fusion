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
  writeFile
} = require('../../src/utils/promises')

const unpack = require('../../src/utils/unpack')

const Layout = require('../../src/react/shared/components/Layout')

const {
  // apiPrefix,
  componentDistRoot,
  componentSrcRoot
} = require('../../environment')

require('../../mock-requires/client')
require('@babel/register')(require('../../webpack/shared/babel-options'))

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

const generateManifest = (collection, outputTypeManifest) => {
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
      if (outputTypeManifest) {
        componentMap[componentType].outputTypes = componentMap[componentType].outputTypes || {}
        componentMap[componentType].outputTypes.default = createComponentEntry(fp, collection, componentType, 'default')
      } else {
        Object.assign(componentMap[componentType], createComponentEntry(fp, collection, componentType))
      }
    })

  if (outputTypeManifest) {
    const outputTypeArray = Object.keys(outputTypeManifest)
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

    Object.values(componentMap)
      .forEach((componentType) => {
        Object.values(outputTypeManifest)
          .forEach((outputTypeConfig) => {
            if (outputTypeConfig.fallback.length && !componentType.outputTypes.hasOwnProperty(outputTypeConfig.type)) {
              const fallbackOutputType = outputTypeConfig.fallback.find(
                (fallbackOutputType) =>
                  componentType.outputTypes.hasOwnProperty(fallbackOutputType)
              )
              componentType.outputTypes[outputTypeConfig.type] = Object.assign(
                {},
                componentType.outputTypes[fallbackOutputType],
                {outputType: outputTypeConfig.type}
              )
            }
          })
      })
  } else {
    Object.keys(componentMap)
      .forEach((componentType) => {
        const Component = unpack(require(componentMap[componentType].src))
        componentMap[componentType].fallback = (Component)
          ? []
            .concat(
              (Component.fallback === true || Component.fallback === undefined)
                ? (componentType === 'default' ? [] : 'default')
                : (Component.fallback)
                  ? Component.fallback
                  : []
            )
          : null
      })
  }

  if (collection === 'layouts') {
    Object.values(componentMap)
      .forEach(layout => {
        Object.values(layout.outputTypes)
          .forEach(layoutOutputType => {
            const Component = Layout(unpack(require(layoutOutputType.src)))
            layoutOutputType.sections = Component.sections
          })
      })
  }

  return componentMap
}

function generateManifestFile (collection, outputTypeManifest) {
  const filePath = `${componentDistRoot}/${collection}/fusion.manifest.json`
  const manifest = generateManifest(collection, outputTypeManifest)
  writeFile(filePath, JSON.stringify(manifest, null, 2))
  return manifest
}

function generate () {
  const outputTypeManifest = generateManifestFile('output-types')
  ;[
    'chains',
    'features',
    'layouts'
  ].forEach(collection => generateManifestFile(collection, outputTypeManifest))
}

module.exports = generate
