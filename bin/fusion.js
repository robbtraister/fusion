#!/usr/bin/env node

'use strict'

const { spawn } = require('child_process')
const path = require('path')

const { bundleRoot, fusionRoot, version } = require('../env')

function _npmCommand (cmds) {
  const options = {
    cwd: path.dirname(__dirname),
    env: {
      ...process.env,
      BUNDLE_ROOT: path.resolve('.')
    },
    stdio: 'inherit'
  }

  const subprocesses = [].concat(cmds).map(cmd =>
    spawn('npm', ['run', cmd], options).on('close', function (code) {
      if (code) {
        subprocesses.forEach(subprocess => {
          subprocess.kill()
        })
      }
    })
  )
}

const build = () => _npmCommand('build')
const dev = () => _npmCommand(['watch', 'start'])
const prod = () => _npmCommand('prod')
const start = () => _npmCommand('start')

function help () {
  console.log(`Version: fusion ${version}

Usage: fusion [command]

Commands:
  build
  dev
  prod
  start
  version
`)
}

function displayVersion () {
  console.log(version)
}

const commands = {
  build,
  dev,
  help,
  prod,
  start,
  version: displayVersion
}

if (module === require.main) {
  ;(commands[process.argv[2]] || help)()
}
