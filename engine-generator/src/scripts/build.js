'use strict'

const path = require('path')

const debug = require('debug')('fusion:engine-generator:build')

const promises = require('../utils/promises')

function build (cwd) {
  debug(`building ${cwd}`)
  return promises.exec('if [ -f ./package.json ]; then npm install --production; fi', {cwd: path.resolve(cwd, 'bundle')})
    .then(() => promises.spawn('npm', ['run', 'build:all:production'], {cwd}))
    .then(() => {
      debug(`built ${cwd}`)
      return cwd
    })
}

module.exports = build

if (module === require.main) {
  build()
    .catch(console.error)
}
