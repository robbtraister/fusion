'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine-generator:build')

const promises = require('../utils/promises')

async function build (cwd) {
  debug(`building ${cwd}`)
  await promises.exec('if [ -f ./package.json ]; then npm install --production; fi', {cwd: path.resolve(cwd, 'bundle')})
  await promises.spawn('npm', ['run', 'build:all:production'], {cwd})
  debug(`built ${cwd}`)
  return cwd
}

module.exports = build

if (module === require.main) {
  build()
    .then(console.log)
    .catch(console.error)
}
