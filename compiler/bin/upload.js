#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:compiler')

const AWS = require('aws-sdk')
const s3 = new AWS.S3({region: 'us-east-1'})

const {
  compilerArtifact
} = require('./configs')

const awsUpload = promisify(s3.upload.bind(s3))

async function upload (fp) {
  debug(`uploading ${fp}`)

  const result = await awsUpload(
    Object.assign(
      compilerArtifact(),
      { Body: fs.createReadStream(fp) }
    )
  )

  debug(`uploaded: ${JSON.stringify(result)}`)
  return result
}

async function main () {
  return upload(path.resolve(__dirname, '../dist/compiler.zip'))
}

module.exports = main

if (module === require.main) {
  main()
    .then(console.log)
    .catch(console.error)
}
