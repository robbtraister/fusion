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

  return (outputType) => {
    const { options } = outputType
    const fileGlob = (options.length > 1) ? `{${options.join(',')}}` : options.join('')

    return function getCollectionManifest (collection) {
      const levels = LEVELS[collection] || 1
      const collectionRoot = path.resolve(bundleRoot, 'components', collection)

      function getComponentName (componentPath) {
        const relativePath = path.relative(collectionRoot, componentPath)
        return stripExt(relativePath.split(path.sep).slice(0, levels).join('/'))
      }

      const sourceFiles = [].concat(
        glob.sync(path.resolve(collectionRoot, `${getWildcards(levels)}.{js,jsx,ts,tsx}`)),
        glob.sync(path.resolve(collectionRoot, `${getWildcards(levels)}/${fileGlob}`))
      )

      return {
        [collection]: Object.assign(
          {},
          ...sourceFiles.map((sourceFile) => ({
            [getComponentName(sourceFile)]: path.relative(bundleRoot, sourceFile)
          }))
        )
      }
    }
  }
}
