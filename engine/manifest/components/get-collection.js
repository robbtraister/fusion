'use strict'

const path = require('path')

const glob = require('glob')

const LEVELS = {
  features: 2
}

function getWildcards (levels) {
  return '*/'.repeat(levels || 1).replace(/\/+$/, '')
}

function stripExt (filePath) {
  const fileParts = path.parse(filePath)
  return path.join(fileParts.dir, fileParts.name)
}

module.exports = (env) => {
  const { bundleRoot } = env

  return (outputTypes) => {
    return function getCollectionManifest (collection) {
      const levels = LEVELS[collection] || 1
      const collectionRoot = path.resolve(bundleRoot, 'components', collection)

      const result = {}
      Object.values(outputTypes)
        .forEach(outputTypeManifest => {
          const { options, outputType } = outputTypeManifest
          const fileGlob = (options.length > 1) ? `{${options.join(',')}}` : options.join('')

          function getComponentName (componentPath) {
            const relativePath = path.relative(collectionRoot, componentPath)
            return stripExt(relativePath.split(path.sep).slice(0, levels).join('/'))
          }

          const sourceFiles = [].concat(
            glob.sync(path.resolve(collectionRoot, `${getWildcards(levels)}.{js,jsx,ts,tsx}`)),
            glob.sync(path.resolve(collectionRoot, `${getWildcards(levels)}/${fileGlob}`))
          )

          sourceFiles.forEach((sourceFile) => {
            const componentName = getComponentName(sourceFile)
            result[componentName] = result[componentName] || {}
            result[componentName][outputType] = path.relative(bundleRoot, sourceFile)
          })
        })

      return {
        [collection]: result
      }
    }
  }
}
