'use strict'

const { promisify } = require('util')

const {
  region
} = require('../../environment')

const { S3 } = require('aws-sdk')
const s3 = new S3({ region })

module.exports = {
  getObject: promisify(s3.getObject.bind(s3)),
  upload: promisify(s3.upload.bind(s3))
}
