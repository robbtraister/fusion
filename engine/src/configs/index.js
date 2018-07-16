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
            selectOptions: customField.args.map((value) => ({
              value,
              name: (customField.tags && customField.tags.labels && customField.tags.labels[value]) || value
            }))
          }
          : {}
        return Object.assign(
          {},
          customField.tags || {},
          {
            id,
            fieldType,
            required: typeInfo.length > 1 && typeInfo[typeInfo.length - 1] === 'isRequired'
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

function transformSections (manifest) {
  if (manifest.sections instanceof Array) {
    // ignore
  } else if (manifest.sections instanceof Object) {
    manifest.sections = Object.keys(manifest.sections).map((id) => ({id, cssClass: manifest.sections[id]}))
  } else {
    manifest.sections = []
  }
  return manifest
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
