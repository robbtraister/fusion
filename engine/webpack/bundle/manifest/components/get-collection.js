'use strict'

const path = require('path')

const glob = require('glob')

const getEngine = require('./get-engine')

const { bundleRoot } = require('../../../../environment')

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

const FILE_EQUIVALENCES = {
  '.hbs': ['.hbs'],
  '.js': ['.js', '.ts'],
  '.jsx': ['.jsx', '.tsx'],
  '.ts': ['.ts', '.js'],
  '.tsx': ['.tsx', '.jsx']
}

function getCollectionManifests (outputTypeManifest) {
  function getComponentPathForOutputType ({ collection, type, outputType }) {
    const { ext, type: name } = outputTypeManifest[outputType]
    const exts = FILE_EQUIVALENCES[ext]
    return [].concat(
      exts.map((ext) =>
        path.resolve(bundleRoot, 'components', collection, type, `${name}${ext}`)
      ),
      exts.map((ext) =>
        path.resolve(bundleRoot, 'components', collection, `${type}${ext}`)
      )
    )
      .find((componentPath) => {
        try {
          return require.resolve(componentPath)
        } catch (err) {}
      })
  }

  function getComponentPath ({ collection, type, outputType }) {
    const { options } = outputTypeManifest[outputType]
    for (var i = 0; i < options.length; i++) {
      const result = getComponentPathForOutputType({ collection, type, outputType: options[i] })
      if (result) {
        return path.relative(bundleRoot, result)
      }
    }
  }

  const outputTypeFiles = [].concat(
    ...Object.values(outputTypeManifest)
      .map(({ ext, type }) => {
        const exts = FILE_EQUIVALENCES[ext]
        return exts.map((ext) => `${type}${ext}`)
      })
  )

  const fileGlob = (outputTypeFiles.length > 1) ? `{${outputTypeFiles.join(',')}}` : outputTypeFiles.join('')

  return (collection) => {
    const levels = LEVELS[collection] || 1
    const collectionRoot = path.resolve(bundleRoot, 'components', collection)

    function getComponentName (componentPath) {
      const relativePath = path.relative(collectionRoot, componentPath)
      return stripExt(relativePath.split(path.sep).slice(0, levels).join('/'))
    }

    const componentNames = [].concat(
      glob.sync(path.resolve(collectionRoot, `${getWildcards(levels)}.{hbs,js,jsx,ts,tsx}`)),
      glob.sync(path.resolve(collectionRoot, `${getWildcards(levels)}/${fileGlob}`))
    )
      .map(getComponentName)

    return {
      [collection]: Object.assign(
        {},
        ...componentNames.map((type) => ({
          [type]: {
            category: 'components',
            collection,
            type,
            outputTypes: Object.assign(
              {},
              ...Object.keys(outputTypeManifest).map((outputType) => {
                const src = getComponentPath({ collection, type, outputType })
                if (src) {
                  const fileParts = path.parse(src)
                  return {
                    [outputType]: {
                      category: 'components',
                      collection,
                      type,
                      outputType,
                      engine: getEngine(fileParts.ext),
                      entry: path.join(fileParts.dir, fileParts.name),
                      src
                    }
                  }
                }
              })
            )
          }
        }))
      )
    }
  }
}

module.exports = getCollectionManifests
