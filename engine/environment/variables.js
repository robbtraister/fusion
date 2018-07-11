'use strict'

const variables = require('../generated/variables')

const mergeSiteVariables = (siteName) => {
  return Object.assign(
    {},
    variables.global || {},
    variables.sites[siteName] || {}
  )
}

const siteCache = {}
const getSiteVariables = (siteName) => {
  siteCache[siteName] = siteCache[siteName] || mergeSiteVariables(siteName)
  return siteCache[siteName]
}

module.exports = getSiteVariables
