'use strict'

try {
  module.exports = require('./manifest.json')
} catch (e) {
  const fs = require('fs')
  const path = require('path')

  const glob = require('glob')

  const {
    // apiPrefix,
    componentDistRoot,
    componentSrcRoot
  } = require('..')

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
          type,
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
            type,
            id: componentName,
            outputTypes: {}
          }
          componentMap[componentName].outputTypes[outputType] = createComponentEntry(fp, type, componentName, outputType)
        })
    }

    return componentMap
  }

  const outputTypes = getComponentType('output-types')
  const outputTypeList = Object.keys(outputTypes)

  const chains = getComponentType('chains', outputTypeList)
  const features = getComponentType('features', outputTypeList)
  const layouts = getComponentType('layouts', outputTypeList)

  module.exports = {
    components: {
      chains,
      features,
      layouts,
      outputTypes
    }
  }

  fs.writeFile(
    path.join(__dirname, './manifest.json'),
    JSON.stringify(module.exports, null, 2),
    (err, data) => {
      if (err) {
        console.error(err)
      }
    }
  )
}
