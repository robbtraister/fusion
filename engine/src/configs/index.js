'use strict'

const {
  componentDistRoot,
  isDev
} = require('../../environment')

const getCustomFields = require('./custom-fields')
const getDisplayPropTypes = require('./display-prop-types')
const getSections = require('./sections')

const customTypes = Object.keys(require('../react/shared/prop-types/custom-types'))

const FIELD_TYPE_MAP = Object.assign(
  {
    // react-prop-type: pb-classic-field-type
    'bool': 'boolean',
    'oneOf': 'select',
    'string': 'text',
    'number': 'number'
  },
  ...customTypes
    .map((type) => ({ [type]: type }))
)

function transformPropTypes (propTypes) {
  return (propTypes)
    ? Object.keys(propTypes)
      .map(id => {
        const propType = propTypes[id]
        const typeInfo = propType.type.split('.')
        const fieldType = FIELD_TYPE_MAP[typeInfo[0]] || 'text'

        const options = (fieldType === 'contentConfig')
          ? propType.args
          : (fieldType === 'select')
            ? {
              selectOptions: propType.args.map((value) => ({
                value,
                name: (propType.tags && propType.tags.labels && propType.tags.labels[value]) || value
              }))
            }
            : {}

        return Object.assign(
          {},
          propType.tags || {},
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
      customFields: transformPropTypes(getCustomFields(manifest[id])) || []
    }))
}

function transformSections (component) {
  return getSections(component)
    .map((id) => ({ id }))
}

function transformLayoutConfigs (manifest) {
  return Object.keys(manifest)
    .map(id => ({
      id,
      sections: transformSections(manifest[id]) || []
    }))
}

function transformOutputTypeConfigs (manifest) {
  return Object.keys(manifest)
    .map((id) => ({
      id,
      displayPropTypes: transformPropTypes(getDisplayPropTypes(manifest[id])) || []
    }))
}

const getManifestFile = (type) => `${componentDistRoot}/${type}/fusion.manifest.json`

function getConfigs (type) {
  const manifest = require(getManifestFile(type))

  const transform = {
    layouts: transformLayoutConfigs,
    'output-types': transformOutputTypeConfigs
  }[type] || transformComponentConfigs

  return transform(manifest)
}

module.exports = (isDev)
  ? (type) => {
    delete require.cache[getManifestFile(type)]
    return getConfigs(type)
  }
  : getConfigs
