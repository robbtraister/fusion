#!/usr/bin/env node

'use strict'

const path = require('path')

const glob = require('glob')

const { bundleRoot } = require('../../environment')

function getCollectionManifest (collection) {
  const sourceFiles = glob.sync(path.resolve(bundleRoot, 'content', collection, `*.{js,json,ts}`))

  return {
    [collection]: Object.assign(
      {},
      ...sourceFiles.map((sourceFile) => {
        const type = path.parse(sourceFile).name
        const src = path.relative(bundleRoot, sourceFile)
        return {
          [type]: {
            category: 'content',
            collection,
            type,
            src,
            dst: src.replace(/\.ts$/, '.js')
          }
        }
      })
    )
  }
}

module.exports = getCollectionManifest

if (module === require.main) {
  console.log(JSON.stringify(getCollectionManifest(process.argv[2]), null, 2))
}
