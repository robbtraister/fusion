'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const mimeTypes = require('mime-types')

const debug = require('debug')('fusion:compiler:upload')

const S3 = require('aws-sdk').S3

const promises = require('./utils/promises')

const {
  bundleKey,
  engineArtifact,
  engineDistPrefix,
  engineResourcesPrefix,
  S3Bucket
} = require('./configs')

const build = require('./scripts/build')
const deploy = require('./scripts/deploy')
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
  constructor (environment, bundleName, variables, region) {
    this.environment = environment
    this.bundleName = bundleName
    this.variables = variables || {}
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
      promises.remove(await downloadFilePromise)

      await copySrcPromise
      await build(await rootDirPromise)
      await zip(await zipFilePromise, await rootDirPromise)

      const { VersionId } = await this.upload(await zipFilePromise)
      promises.remove(await zipFilePromise)

      const { Version } = await deploy(this.environment, VersionId)

      const result = await this.pushResources(Version, await rootDirPromise)
      promises.remove(await rootDirPromise)

      return result
    } catch (e) {
      promises.remove(await downloadFilePromise)
      promises.remove(await rootDirPromise)
      promises.remove(await zipFilePromise)
      throw e
    }
  }

  async download (destFilePromise) {
    const params = {
      Bucket: S3Bucket,
      Key: this.bundlePath
    }
    // if (VersionId) {
    //   params.VersionId = VersionId
    // }

    const destFile = await destFilePromise
    debug(`downloading ${params.Bucket} ${params.Key} to ${destFile}`)
    const data = await this.s3getObject(params)
    await promises.writeFile(destFile, data.Body)
    debug(`downloaded ${params.Bucket} ${params.Key} to ${destFile}`)

    return destFile
  }

  async pushResources (deployment, srcDir) {
    async function pushFile (fp, Key) {
      const resultPromise = await this.s3upload(
        {
          ACL: 'public-read',
          Body: fs.createReadStream(fp),
          Bucket: S3Bucket,
          ContentType: mimeTypes.contentType(path.extname(fp)) || 'application/octet-stream',
          Key
        }
      )
      debug(`uploaded: ${fp}`)
      return resultPromise
    }

    async function pushFiles (cwd, prefix) {
      const files = await promises.glob('**/*', {cwd, nodir: true})
      return Promise.all(
        files.map(file => pushFile(path.join(cwd, file), path.join(prefix, file)))
      )
    }

    return Promise.all([
      pushFiles(path.join(srcDir, 'bundle', 'resources'), engineResourcesPrefix(this.environment, deployment)),
      pushFiles(path.join(srcDir, 'dist'), engineDistPrefix(this.environment, deployment))
    ])
  }

  async upload (fp) {
    debug(`uploading ${fp} for ${this.environment}`)

    const resultPromise = await this.s3upload(
      Object.assign(
        engineArtifact(this.environment),
        { Body: fs.createReadStream(fp) }
      )
    )
    debug(`uploaded: ${fp}`)
    return resultPromise
  }
}

module.exports = Compiler
