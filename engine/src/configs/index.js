'use strict'

const {
  componentDistRoot,
  isDev
} = require('../../environment')

const getCustomFields = require('./custom-fields')
const getSections = require('./sections')

const FIELD_TYPE_MAP = {
  // react-prop-type: pb-classic-field-type
  'bool': 'boolean',
  'oneOf': 'select',
  'string': 'text',
  'number': 'number',
  'contentConfig': 'contentConfig'
}

function transformCustomFields (component) {
  const customFields = getCustomFields(component)

  return (customFields)
    ? Object.keys(customFields)
      .map(id => {
        const customField = customFields[id]
        const typeInfo = customField.type.split('.')
        const fieldType = FIELD_TYPE_MAP[typeInfo[0]] || 'text'
        const options = (fieldType === 'contentConfig')
          ? customField.args
          : (fieldType === 'select')
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
      customFields: transformCustomFields(manifest[id]) || []
    }))
}

function transformSections (component) {
  return getSections(component)
    .map((id) => ({id}))
}

function transformLayoutConfigs (manifest) {
  return Object.keys(manifest)
    .map(id => ({
      id,
      sections: transformSections(manifest[id]) || []
    }))
}

const getManifestFile = (type) => `${componentDistRoot}/${type}/fusion.manifest.json`

function getConfigs (type) {
  const manifest = require(getManifestFile(type))

  const transform = {
    layouts: transformLayoutConfigs,
    'output-types': (manifest) => Object.keys(manifest).map((id) => ({id}))
  }[type] || transformComponentConfigs

  return transform(manifest)
}

module.exports = (isDev)
  ? (type) => {
    delete require.cache[getManifestFile(type)]
    return getConfigs(type)
  }
  : getConfigs
