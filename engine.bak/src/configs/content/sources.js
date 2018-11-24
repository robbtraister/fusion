'use strict'

const getManifest = require('./get-manifest')

const getSource = require('../../models/sources')

function getPatternParams (p) {
  const idMatcher = /\{([^}]+)\}/g
  const result = []
  while (true) {
    const key = idMatcher.exec(p)
    if (key) {
      result.push(key[1])
    } else {
      break
    }
  }
  return result
}

function transformContentConfigs (manifest) {
  const idFields = (manifest.pattern)
    ? getPatternParams(manifest.pattern)
      .map((key) => ({ key, type: 'text' }))
    : null

  return {
    service: manifest.service || manifest.name,
    config: manifest.content || manifest.config || manifest.schemaName,
    idFields: idFields || [],
    paramFields: manifest.params || []
  }
}

module.exports = async () => {
  const sourceManifest = getManifest('sources')

  const sources = await Promise.all(
    Object.keys(sourceManifest)
      .map((sourceName) =>
        getSource(sourceName)
          .catch(() => null)
      )
  )

  return sources
    .filter(source => source)
    .map(transformContentConfigs)
}
