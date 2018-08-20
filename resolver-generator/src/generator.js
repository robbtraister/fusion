'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:resolver-generator')

const S3 = require('aws-sdk').S3

const promises = require('./utils/promises')

const {
  resolverArtifact
} = require('./configs')

const deploy = require('./scripts/deploy')
const zip = require('./scripts/zip')

async function copy (srcPromise, destPromise) {
  const src = await srcPromise
  const dest = await destPromise
  debug(`copying ${src} to ${dest}`)
  const result = await promises.copy(src, dest)
  debug(`copied ${src} to ${dest}`)
  return result
}
class Generator {
  constructor (bucket, resolverPath, region) {
    this.bucket = bucket
    this.resolverPath = resolverPath

    // parse the environment from the resolver path
    // i.e. resolver path would be environment/${environment}/resolvers.json
    const resolverMatch = this.resolverPath.match('^environments/([\\w-]+)/resolvers.json')
    if (resolverMatch) {
      this.contextName = resolverMatch[1]
    } else {
      throw new Error(`Unable to parse contextName from S3 event with path: ${JSON.stringify(this.resolverPath)}`)
    }
    debug(`Generating new resolver service for ${this.contextName}`)

    this.region = region || 'us-east-1'
    this.s3 = new S3({region: this.region})
    this.s3getObject = promisify(this.s3.getObject.bind(this.s3))
    this.s3upload = promisify(this.s3.upload.bind(this.s3))
  }

  async generate () {
    const rootDirPromise = promises.tempDir()
    const zipFilePromise = promises.tempFile()

    try {
      await copy(path.resolve(__dirname, '../../resolver/*'), rootDirPromise)

      await this.download(path.resolve(await rootDirPromise, 'config/resolvers.json'))

      await zip(await zipFilePromise, await rootDirPromise)
      await this.upload(await zipFilePromise)

      await deploy(this.contextName)
    } finally {
      await Promise.all([
        promises.remove(await rootDirPromise),
        promises.remove(await zipFilePromise)
      ])
    }
  }

  async download (destFilePromise) {
    const params = {
      Bucket: this.bucket,
      Key: this.resolverPath
    }

    const destFile = await destFilePromise
    debug(`downloading ${params.Bucket} ${params.Key} to ${destFile}`)
    const data = await this.s3getObject(params)
    await promises.writeFile(destFile, data.Body)
    debug(`downloaded ${params.Bucket} ${params.Key} to ${destFile}`)

    return destFile
  }

  async upload (fp) {
    debug(`uploading ${fp} for ${this.contextName}`)

    return this.s3upload(
      Object.assign(
        resolverArtifact(this.contextName),
        { Body: fs.createReadStream(fp) }
      )
    )
      .then(data => {
        debug(`uploaded: ${JSON.stringify(data)}`)
        return data
      })
  }
}

module.exports = Generator
