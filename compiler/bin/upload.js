#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const debug = require('debug')('fusion:compiler')

const AWS = require('aws-sdk')
const s3 = new AWS.S3({ region: 'us-east-1' })

const {
  artifact
} = require('./configs')

const awsUpload = promisify(s3.upload.bind(s3))

async function upload (type, fp) {
  debug(`uploading ${fp}`)

  const result = await awsUpload(
    Object.assign(
      artifact(type),
      { Body: fs.createReadStream(fp) }
    )
  )

  debug(`uploaded: ${JSON.stringify(result)}`)
  return result
}

async function main () {
  return Promise.all([
    upload('compiler', path.resolve(__dirname, '../dist/compiler.zip')),
    upload('engine', path.resolve(__dirname, '../dist/engine.zip'))
  ])
}

module.exports = main

if (module === require.main) {
  main()
    .then(console.log)
    .catch(console.error)
}
