'use strict'

const childProcess = require('child_process')
const path = require('path')

module.exports = (env) => {
  const { projectRoot } = env

  return function getComponentManifest () {
    // execute this as a separate process because it needs inline babel
    const { outputTypes, ...collections } = JSON.parse(
      childProcess.execSync(`node ${path.resolve(projectRoot, 'manifest', 'components')}`)
        .toString()
    ).components

    return {
      outputTypes: Object.values(outputTypes)
        .filter((manifest) => /^\.jsx$/.test(manifest.ext)),
      ...collections
    }
  }
}
