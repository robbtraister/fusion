'use strict'

const debug = require('debug')('fusion:compiler:build')

const promises = require('../utils/promises')

async function build (cwd) {
  debug(`building ${cwd}`)
  await promises.spawn('npm', ['run', 'build:all:production'], {
    cwd,
    stdio: 'inherit',
    env: Object.assign({},
      process.env,
      // npm tries to install configs in the HOME directory
      // lambda does not allow write access to the HOME directory, so change it
      { HOME: cwd }
    )
  })
  debug(`built ${cwd}`)
  // remove the unnecessary configs left over from npm install
  await promises.exec(`rm -rf .config .npm`, {
    cwd
  })
  return cwd
}

module.exports = build

if (module === require.main) {
  build()
    .then(console.log)
    .catch(console.error)
}
