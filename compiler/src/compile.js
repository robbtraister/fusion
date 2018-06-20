'use strict'

const path = require('path')

const debug = require('debug')('fusion:compiler')

const { bundleKey } = require('./configs')
const promises = require('./utils/promises')

const build = require('./scripts/build')
const decrypt = require('./scripts/decrypt')
const download = require('./scripts/download')
const extract = require('./scripts/extract')
const upload = require('./scripts/upload')
const zip = require('./scripts/zip')

async function copy (srcPromise, destPromise) {
  const src = await srcPromise
  const dest = await destPromise
  debug(`copying ${src} to ${dest}`)
  const result = await promises.copy(src, dest)
  debug(`copied ${src} to ${dest}`)
  return result
}

async function extractZip (fpPromise, destPromise) {
  const fp = await fpPromise
  const dest = await destPromise
  await extract(fp, dest)
  promises.remove(fp)
  return dest
}

async function getBundleDir (tempDirPromise) {
  const tempDir = await tempDirPromise
  return promises.mkdirp(path.resolve(tempDir, 'bundle'))
}

async function compile (bundleName) {
  const rootDirPromise = promises.tempDir()

  try {
    const copySrcPromise = copy(path.resolve(__dirname, '../../engine/*'), rootDirPromise)

    const downloadFilePromise = download(bundleKey(bundleName))

    try {
      const extractPromise = extractZip(await downloadFilePromise, getBundleDir(rootDirPromise))

      await extractPromise

      await copySrcPromise
      await Promise.all([
        build(await rootDirPromise),
        decrypt(path.resolve(await rootDirPromise, 'bundle'))
      ])

      const zipFilePromise = await zip({
        bundle: path.resolve(await rootDirPromise, 'bundle'),
        dist: path.resolve(await rootDirPromise, 'dist')
      })

      try {
        const result = await upload(await zipFilePromise)

        return result
      } finally {
        promises.remove(await zipFilePromise)
      }
    } finally {
      promises.remove(await downloadFilePromise)
    }
  } finally {
    promises.remove(await rootDirPromise)
  }
}

module.exports = compile
