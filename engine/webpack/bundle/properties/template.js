'use strict'

module.exports = ({ globalFile, siteFiles }) => `
const unpack = require('${require.resolve('../../../src/utils/unpack')}')
const properties = {
  global: ${globalFile ? `unpack(require('${globalFile}'))` : '{}'},
  sites: {
    ${
  Object.keys(siteFiles)
    .map(name => `'${name}': unpack(require('${siteFiles[name]}'))`).join(',\n    ')
}
  }
}

const siteCache = {}
module.exports = (siteName) => {
  siteCache[siteName] = siteCache[siteName] || Object.assign(
    {},
    properties.global || {},
    properties.sites[siteName] || {}
  )
  return siteCache[siteName]
}
`
