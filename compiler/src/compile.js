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
  await promises.remove(fp)
  return dest
}

async function compile (bundleName, contextPath) {
  const rootDir = await promises.tempDir()

  try {
    const copySrcPromise = copy(path.resolve(__dirname, '../../engine/*'), rootDir)

    const downloadFilePromise = download(bundleKey(bundleName))

    try {
      const bundleDir = path.resolve(rootDir, 'bundle')
      const bundleSrcDir = path.resolve(bundleDir, 'src')
      const extractPromise = extractZip(await downloadFilePromise, bundleSrcDir)

      await extractPromise
      await copySrcPromise

      await build(rootDir, contextPath)
      // don't decrypt until after build to ensure no secrets are compiled into client-side code
      await decrypt(bundleSrcDir)

      const zipFilePromise = await zip({
        bundle: bundleDir
      })

      try {
        return await upload(await zipFilePromise)
      } finally {
        await promises.remove(await zipFilePromise)
      }
    } finally {
      await promises.remove(await downloadFilePromise)
    }
  } finally {
    await promises.remove(rootDir)
  }
}

module.exports = compile
