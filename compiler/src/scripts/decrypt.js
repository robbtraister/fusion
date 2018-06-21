'use strict'

const path = require('path')

const debug = require('debug')('fusion:compiler:decrypt')

const kms = require('../aws/kms')

const {
  readFile,
  writeFile
} = require('../utils/promises')

const envFiles = [
  'environment.js',
  'environment.json',
  'environment/index.js',
  'environment/index.json'
]

const secretMask = /%\{([^}]+)\}/g
async function decryptValue (value) {
  const secretMap = {}

  try {
    value.replace(secretMask, function (match, prop) {
      debug(`decrypting value: ${prop}`)
      secretMap[prop] = secretMap[prop] || kms.decrypt(prop).catch((err) => {
        debug(`failed to decrypt value [${prop}]: ${err}`)
        return prop
      })
    })

    const keys = Object.keys(secretMap)

    const decrypted = await Promise.all(keys.map(key => secretMap[key]))
    const decryptedMap = {}
    keys.forEach((k, i) => { decryptedMap[k] = decrypted[i] })
    return value.replace(secretMask, (match, prop) => (decryptedMap[prop] || `%{${match}}`))
  } catch (e) {
    return value
  }
}

async function decryptFile (fp) {
  try {
    debug(`decrypting file: ${fp}`)
    const ciphertext = await readFile(fp)
    const plaintext = await decryptValue(ciphertext.toString())
    return writeFile(fp, plaintext)
  } catch (e) {
    debug(`failed to decrypt file [${fp}]: ${e}`)
    // file probably doesn't exist
  }
}

async function decrypt (rootDir) {
  return Promise.all([
    envFiles.map(f => path.join(rootDir, f)).map(decryptFile)
  ])
}

module.exports = decrypt
