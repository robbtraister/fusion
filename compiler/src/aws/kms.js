'use strict'

const {
  region
} = require('../../environment')

const { KMS } = require('aws-sdk')
const kms = new KMS({region})

module.exports = {
  decrypt (ciphertext) {
    let CiphertextBlob = ciphertext
    if (!(CiphertextBlob instanceof Buffer)) {
      try {
        CiphertextBlob = Buffer.from(ciphertext, 'hex')
      } catch (err) {}
      if (!CiphertextBlob.length) {
        try {
          CiphertextBlob = Buffer.from(ciphertext, 'base64')
        } catch (err) {}
      }
      if (!CiphertextBlob.length) {
        try {
          CiphertextBlob = Buffer.from(ciphertext, 'utf8')
        } catch (err) {}
      }
    }

    return new Promise((resolve, reject) => {
      kms.decrypt({CiphertextBlob}, (err, data) => err ? reject(err) : resolve(data.Plaintext.toString('utf8')))
    })
  }
}
