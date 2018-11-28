'use strict'

const childProcess = require('child_process')
const path = require('path')

const { projectRoot } = require('../../environment')

module.exports = function getComponentManifest () {
  // execute this as a separate process because it needs inline babel
  return JSON.parse(
    childProcess.execSync(`node ${path.resolve(projectRoot, 'manifest')}`)
      .toString()
  )
}
