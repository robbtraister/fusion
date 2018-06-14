'use strict'

const debug = require('debug')('fusion:compiler:build')

const promises = require('../utils/promises')

async function build (cwd) {
  debug(`building ${cwd}`)
  await promises.spawn('npm', ['run', 'build:all:production'], {cwd, stdio: 'inherit'})
  debug(`built ${cwd}`)
  return cwd
}

module.exports = build

if (module === require.main) {
  build()
    .then(console.log)
    .catch(console.error)
}
