'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:compiler')

const S3 = require('aws-sdk').S3

const promises = require('./utils/promises')

const {
  buildArtifact,
  bundleKey,
  S3Bucket
} = require('./configs')

const build = require('./scripts/build')
const extract = require('./scripts/extract')
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

class Compiler {
  constructor (region, environment, bundleName) {
    this.environment = environment
    this.bundleName = bundleName
    this.bundlePath = bundleKey(this.environment, this.bundleName)

    this.region = region || 'us-east-1'
    this.s3 = new S3({region: this.region})
    this.s3getObject = promisify(this.s3.getObject.bind(this.s3))
    this.s3upload = promisify(this.s3.upload.bind(this.s3))
  }

  async compile () {
    const downloadFilePromise = promises.tempFile()
    const rootDirPromise = promises.tempDir()
    const zipFilePromise = promises.tempFile()

    try {
      const copySrcPromise = copy(path.resolve(__dirname, '../../engine/*'), rootDirPromise)

      const downloadPromise = this.download(downloadFilePromise)
      const extractPromise = extractZip(await downloadPromise, getBundleDir(rootDirPromise))

      await extractPromise

      await copySrcPromise
      await build(await rootDirPromise)
      await zip(await zipFilePromise, {
        bundle: path.resolve(await rootDirPromise, 'bundle'),
        dist: path.resolve(await rootDirPromise, 'dist')
      })

      const result = await this.upload(await zipFilePromise)

      return result
    } finally {
      await Promise.all([
        promises.remove(await downloadFilePromise),
        promises.remove(await rootDirPromise),
        promises.remove(await zipFilePromise)
      ])
    }
  }

  async download (destFilePromise) {
    const params = {
      Bucket: S3Bucket,
      Key: this.bundlePath
    }

    const destFile = await destFilePromise
    debug(`downloading ${params.Bucket} ${params.Key} to ${destFile}`)
    const data = await this.s3getObject(params)
    await promises.writeFile(destFile, data.Body)
    debug(`downloaded ${params.Bucket} ${params.Key} to ${destFile}`)

    return destFile
  }

  async upload (fp) {
    debug(`uploading ${fp} for ${this.environment}`)

    const resultPromise = await this.s3upload(
      Object.assign(
        buildArtifact(this.environment),
        { Body: fs.createReadStream(fp) }
      )
    )
    debug(`uploaded: ${fp}`)
    return resultPromise
  }
}

module.exports = Compiler
