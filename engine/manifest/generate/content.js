'use strict'

const path = require('path')

const glob = require('glob')

const {
  writeFile
} = require('../../src/utils/promises')

const {
  schemasBuildRoot,
  schemasSrcRoot,
  sourcesBuildRoot,
  sourcesSrcRoot
} = require('../../environment')

const getEntry = (rootDir) => Object.assign(
  {},
  ...glob.sync(`${rootDir}/*.{js,ts}`)
    .map((f) => {
      return { [path.parse(f).name]: f }
    })
)

const getConfig = (srcRoot, distRoot) => {
  const entry = getEntry(srcRoot)
  writeFile(`${distRoot}/fusion.manifest.json`, JSON.stringify(entry, null, 2))
}

function generate () {
  getConfig(schemasSrcRoot, schemasBuildRoot)
  getConfig(sourcesSrcRoot, sourcesBuildRoot)
}

module.exports = generate
