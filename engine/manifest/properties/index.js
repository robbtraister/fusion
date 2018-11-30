'use strict'

const path = require('path')

const glob = require('glob')

const { bundleRoot } = require('../../environment')

const extGlob = '{js,json,ts,yml,yaml}'

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

module.exports = () => {
  const globalFile = [].concat(
    glob.sync(`${bundleRoot}/properties.${extGlob}`),
    glob.sync(`${bundleRoot}/properties/index.${extGlob}`)
  ).find(getRequirable)

  const siteFiles = Object.assign(
    {},
    ...glob.sync(`${bundleRoot}/properties/sites/*.${extGlob}`)
      .filter(getRequirable)
      .map(sitePath => ({
        [path.parse(sitePath).name]: path.relative(bundleRoot, sitePath)
      }))
  )

  return {
    properties: {
      global: globalFile ? path.relative(bundleRoot, globalFile) : undefined,
      sites: siteFiles
    }
  }
}
