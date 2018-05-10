'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine-generator')

const promises = require('../utils/promises')

const build = require('./build')
const deploy = require('./deploy')
const download = require('./download')
const extract = require('./extract')
const pushResources = require('./push-resources')
const upload = require('./upload')
const zip = require('./zip')

const code = require('./code')
const { S3Bucket } = code()

async function main (deployment, bundleName) {
  const downloadPromise = download(S3Bucket, `${deployment}/bundles/${bundleName}.zip`)

  const tempDirPromise = promises.tempDir()

  const bundleDirPromise = tempDirPromise
    .then((tempDir) => promises.mkdirp(path.resolve(tempDir, 'bundle')))

  const extractPromise = Promise.all([
    downloadPromise,
    bundleDirPromise
  ])
    .then(([bundleFile, bundleDir]) => {
      return extract(bundleFile, bundleDir)
        .then(() => {
          promises.remove(bundleFile)
          return bundleDir
        })
    })

  const copySrcPromise = tempDirPromise
    .then((tempDir) => {
      debug(`copying src to ${tempDir}`)
      return promises.copy(path.resolve(__dirname, '../../engine').replace(/\/*$/, '/'), tempDir)
        .then(() => debug(`copied src to ${tempDir}`))
        .then(() => tempDir)
    })

  const buildPromise = Promise.all([
    copySrcPromise,
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

  const pushPromise = Promise.all([
    buildPromise,
    deployPromise
  ])
    .then(([srcDir, {Version}]) => pushResources(deployment, Version, srcDir))

  return Promise.all([
    tempDirPromise,
    zipPromise,
    pushPromise
  ])
    .then(([srcDir]) => {
      promises.remove(srcDir)
    })
    .then(() => pushPromise)
}

module.exports = main

if (module === require.main) {
  main('test', 'test')
}
