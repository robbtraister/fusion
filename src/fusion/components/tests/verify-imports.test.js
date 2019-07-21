'use strict'

const { execSync } = require('child_process')
const path = require('path')

const glob = require('glob')
const webpack = require('webpack')

const componentsDir = path.resolve(__dirname, '..')

const { dependencies, devDependencies } = require(path.join(
  componentsDir,
  'package.json'
))

const entry = Object.assign(
  {},
  ...glob
    .sync(path.join(componentsDir, '**/*.{js,jsx}'))
    .filter(filePath => !/[\\/.]tests?[\\/.]/.test(filePath))
    .map((filePath, index) => ({ [index]: filePath }))
)

console.log({ entry })
const namespacedModulePattern = /[\\/]node_modules[\\/](@[^\\/]+[\\/][^\\/]+)/
const genericModulePattern = /[\\/]node_modules[\\/]([^\\/]+)/

function verifyModule (mod, pattern) {
  const match = pattern.exec(mod)
  const modName = match && match[1]
  if (modName) {
    if (
      dependencies.hasOwnProperty(modName) ||
      devDependencies.hasOwnProperty(modName)
    ) {
      return true
    } else {
      throw new Error(`module ${modName} not included in package.json`)
    }
  }
  return false
}

function verifyLocal (mod) {
  const localPath = path.relative(componentsDir, mod)
  if (/^\.\.[\\/]/.test(localPath)) {
    throw new Error('not a relative import')
  }
}

function verifyImport (mod) {
  verifyModule(mod, namespacedModulePattern) ||
    verifyModule(mod, genericModulePattern) ||
    verifyLocal(mod)
}

webpack(
  {
    entry,
    target: 'node'
  },
  function (err, stats) {
    execSync(`rm -rf '${path.join(__dirname, 'dist')}'`)

    if (err) {
      console.error(err)
    } else {
      const json = stats.toJson()
      if (stats.hasErrors()) {
        console.error(json.errors)
      } else {
        json.chunks.forEach(chunk => {
          chunk.modules
            .filter(mod => !genericModulePattern.test(mod.issuer))
            .map(mod => verifyImport(mod.identifier))
        })
      }
    }
  }
)
