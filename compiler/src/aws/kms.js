'use strict'

const { promisify } = require('util')

const {
  region
} = require('../../environment')

const { KMS } = require('aws-sdk')
const kms = new KMS({region})

module.exports = {
  decrypt: promisify(kms.decrypt.bind(kms))
}
