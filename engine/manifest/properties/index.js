'use strict'

const path = require('path')

const glob = require('glob')

const getRequirable = (fp) => {
  try {
    return require.resolve(fp)
  } catch (e) {
    return false
  }
}

module.exports = (env) => {
  const { bundleRoot } = env

  const globalFile = getRequirable(`${bundleRoot}/properties`)

  const siteFiles = Object.assign(
    {},
    ...glob.sync(`${bundleRoot}/properties/sites/*.{js,json,ts}`)
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
