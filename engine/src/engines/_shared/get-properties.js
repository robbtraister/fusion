'use strict'

module.exports = (propertiesMap) =>
  (arcSite) => Object.assign(
    {},
    (propertiesMap && propertiesMap.global) || {},
    (propertiesMap && propertiesMap.sites && propertiesMap.sites[arcSite]) || {}
  )
