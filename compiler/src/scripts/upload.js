'use strict'

const fs = require('fs')

const debug = require('debug')('fusion:compiler:upload')

const s3 = require('../aws/s3')

const {
  environment
} = require('../../environment')

const {
  buildArtifact
} = require('../configs')

async function upload (fp) {
  debug(`uploading ${fp} for ${environment}`)

  const resultPromise = await s3.upload(
    Object.assign(
      buildArtifact,
      { Body: fs.createReadStream(fp) }
    )
  )
  debug(`uploaded: ${fp}`)
  return resultPromise
}

module.exports = upload
