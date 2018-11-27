'use strict'

const path = require('path')

const unpack = require('../../../../src/utils/unpack')

const { buildRoot } = require('../../../../environment')

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

function expandConfigFields (sourceConfig) {
  const idFields = (sourceConfig.pattern)
    ? getPatternParams(sourceConfig.pattern)
      .map((key) => ({ key, type: 'text' }))
    : []

  const params = sourceConfig.params
  const paramFields = (!params)
    ? []
    : (params instanceof Object && !(params instanceof Array))
      ? Object.keys(params)
        .map((name) => ({
          name,
          type: params[name]
        }))
      : params

  return {
    idFields: idFields,
    paramFields: paramFields
      .map((paramField) => Object.assign(
        paramField,
        { displayName: paramField.displayName || paramField.name }
      ))
  }
}

module.exports = function getSourceConfig (sourceName) {
  const sourceFile = path.resolve(buildRoot, 'content', 'sources', sourceName)
  const config = unpack(require(sourceFile))

  return {
    id: sourceName,
    service: sourceName,
    config,
    ...expandConfigFields(config)
  }
}
