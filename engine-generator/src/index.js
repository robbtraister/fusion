'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine-generator')

const promises = require('./utils/promises')

const build = require('./scripts/build')
const deploy = require('./scripts/deploy')
const download = require('./scripts/download')
const extract = require('./scripts/extract')
const pushResources = require('./scripts/push-resources')
const upload = require('./scripts/upload')
const zip = require('./scripts/zip')

const code = require('./scripts/code')
const { S3Bucket } = code()

async function getBundleDir (tempDirPromise) {
  const tempDir = await tempDirPromise
  return promises.mkdirp(path.resolve(tempDir, 'bundle'))
}

async function extractZip (fpPromise, destPromise) {
  const fp = await fpPromise
  const dest = await destPromise
  await extract(fp, dest)
  promises.remove(fp)
  return dest
}

async function copy (srcPromise, destPromise) {
  const src = await srcPromise
  const dest = await destPromise
  debug(`copying ${src} to ${dest}`)
  const result = await promises.copy(src, dest)
  debug(`copied ${src} to ${dest}`)
  return result
}

async function main (deployment, bundleName) {
  const downloadFilePromise = promises.tempFile()
  const rootDirPromise = promises.tempDir()
  const zipFilePromise = promises.tempFile()

  try {
    const copySrcPromise = copy(path.resolve(__dirname, '../../engine/*'), rootDirPromise)

    const downloadPromise = download(downloadFilePromise, S3Bucket, `${deployment}/bundles/${bundleName}`)
    const extractPromise = extractZip(await downloadPromise, getBundleDir(rootDirPromise))

    await extractPromise
    promises.remove(await downloadFilePromise)

    await copySrcPromise
    await build(await rootDirPromise)
    await zip(await zipFilePromise, await rootDirPromise)

    const { VersionId } = await upload(deployment, await zipFilePromise)
    promises.remove(await zipFilePromise)

    const { Version } = await deploy(deployment, VersionId)

    const result = await pushResources(deployment, Version, await rootDirPromise)
    promises.remove(await rootDirPromise)

    return result
  } catch (e) {
    promises.remove(await downloadFilePromise)
    promises.remove(await rootDirPromise)
    promises.remove(await zipFilePromise)
    throw e
  }
}

module.exports.handler = (event, context, callback) => {
  main(event.deployment, event.bundle)
    .then((result) => callback(null, result))
    .catch((err) => {
      console.error(err)
      callback(err)
    })
}

if (module === require.main) {
  main('test', 'test')
    .then(console.log)
    .catch(console.error)
}
