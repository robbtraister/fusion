#!/usr/bin/env node

'use strict'

const path = require('path')

const glob = require('glob')

function collectionManifestFactory (env) {
  const { bundleRoot } = env

  return function getCollectionManifest (collection) {
    const sourceFiles = glob.sync(path.resolve(bundleRoot, 'content', collection, `*.{js,json,ts}`))

    return {
      [collection]: Object.assign(
        {},
        ...sourceFiles.map((sourceFile) => ({
          [path.parse(sourceFile).name]: path.relative(bundleRoot, sourceFile)
        }))
      )
    }
  }
}

module.exports = collectionManifestFactory

if (module === require.main) {
  console.log(JSON.stringify(collectionManifestFactory(require('../../environment'))(process.argv[2]), null, 2))
}
