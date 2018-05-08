'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine-generator')

const promises = require('../utils/promises')

const build = require('./build')
const deploy = require('./deploy')
const download = require('./download')
const extract = require('./extract')
// const pushResources = require('./push-resources')
const upload = require('./upload')
const zip = require('./zip')

async function main (deployment) {
  const downloadPromise = download('pagebuilder-fusion', 'fusion-bundle.zip')

  const tempDirPromise = promises.tempDir()

  const copySrcPromise = tempDirPromise
    .then((tempDir) => {
      const bundleDir = path.resolve(tempDir, 'bundle')
      debug(`copying src to ${tempDir}`)
      return promises.copy(path.resolve(__dirname, '../../engine').replace(/\/*$/, '/'), tempDir)
        .then(() => debug(`copied src to ${tempDir}`))
        .then(() => promises.remove(`${bundleDir}`))
        .then(() => promises.mkdirp(bundleDir))
    })

  const extractPromise = Promise.all([
    downloadPromise,
    copySrcPromise
  ])
    .then(([bundleFile, bundleDir]) => {
      return extract(bundleFile, bundleDir)
        .then(() => {
          promises.remove(bundleFile)
          return bundleDir
        })
    })

  const buildPromise = Promise.all([
    tempDirPromise,
    extractPromise
  ])
    .then(([srcDir]) => build(srcDir))

  const zipPromise = Promise.all([
    promises.tempFile(),
    tempDirPromise,
    buildPromise
  ])
    .then(([destFile, srcDir]) => zip(destFile, srcDir)
      .then((zipFile) => {
        promises.remove(srcDir)
        return zipFile
      })
    )

  const uploadPromise = zipPromise
    .then((zipFile) => upload(deployment, zipFile)
      .then((data) => {
        promises.remove(zipFile)
        return data
      })
    )

  const deployPromise = uploadPromise
    .then(({VersionId}) => deploy(deployment, VersionId))
  //
  // const pushPromise = deployPromise
  //   .then((deployment) => pushResources(deployment))

  return deployPromise
}

module.exports = main

if (module === require.main) {
  main('test')
}
