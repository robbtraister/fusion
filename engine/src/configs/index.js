'use strict'

const {
  componentDistRoot,
  isDev
} = require('../../environment')

const FIELD_TYPE_MAP = {
  // react-prop-type: pb-classic-field-type
  'bool': 'boolean',
  'oneOf': 'select',
  'string': 'text',
  'number': 'number'
}

function transformCustomFields (customFields) {
  return (customFields)
    ? Object.keys(customFields)
      .map(id => {
        const customField = customFields[id]
        const typeInfo = customField.type.split('.')
        const fieldType = FIELD_TYPE_MAP[typeInfo[0]] || 'text'
        const options = (fieldType === 'select')
          ? {
            selectOptions: customField.args
          }
          : {}
        return Object.assign(
          {},
          customField.tags || {},
          {
            id,
            fieldType,
            isRequired: typeInfo.length > 1 && typeInfo[typeInfo.length - 1] === 'isRequired'
          },
          options
        )
      })
    : null
}

function transformComponentConfigs (manifest) {
  return Object.keys(manifest)
    .map(id => ({
      id,
      customFields: transformCustomFields(manifest[id].customFields) || []
    }))
}

const getManifestFile = (type) => `${componentDistRoot}/${type}/fusion.manifest.json`

function getConfigs (type) {
  const manifest = require(getManifestFile(type))
  return transformComponentConfigs(manifest)
}

module.exports = (isDev)
  ? (type) => {
    delete require.cache[getManifestFile(type)]
    return getConfigs(type)
  }
  : getConfigs
