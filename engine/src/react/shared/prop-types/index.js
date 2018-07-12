'use strict'

const PropTypes = require('../../../../node_modules/prop-types')

const taggablePrimitive = (propType, type) => {
  const isRequiredName = `${type}.isRequired`

  propType.type = type

  propType.tag = (tags) => {
    const instance = (...args) => propType(...args)
    instance.type = type
    instance.args = propType.args
    instance.tags = tags
    if (propType.isRequired) {
      instance.isRequired = (...args) => propType.isRequired(...args)
      instance.isRequired.type = isRequiredName
      instance.isRequired.args = propType.args
      instance.isRequired.tags = tags
    }
    return instance
  }

  // in production, propType is just a placeholder function, so make sure we aren't recursing infinitely
  if (propType.isRequired && propType.isRequired !== propType) {
    propType.isRequired.type = isRequiredName
    propType.isRequired.args = propType.args
    taggablePrimitive(propType.isRequired, isRequiredName)
  }

  return propType
}

const taggableComplex = (propType, type) => (args) => {
  const f = propType(args)
  f.args = args
  return taggablePrimitive(f, type)
}

const taggable = (propType, type) => {
  return (propType.name === 'bound checkType')
    ? taggablePrimitive(propType, type)
    : taggableComplex(propType, type)
}

const FusionPropTypes = Object.assign(
  ...Object.keys(PropTypes)
    .map(key => ({
      [key]: ['PropTypes', 'checkPropTypes'].includes(key)
        ? PropTypes[key]
        : taggable(PropTypes[key], key)
    }))
)

FusionPropTypes.contentConfig = (contentType) => {
  const instance = (props, propName, componentName) => {
    const prop = props[propName]
    if (prop) {
      if (!(props.sourceName || prop.source || prop.contentService)) {
        return new Error(`${propName} is missing property 'contentService' on ${componentName}`)
      }
      if (!(prop.key || prop.contentConfigValues)) {
        return new Error(`${propName} is missing property 'contentConfigValues' on ${componentName}`)
      }
    }
  }

  instance.isRequired = (props, propName, componentName) => {
    const prop = props[propName]
    if (!prop) {
      return new Error(`${propName} is required on ${componentName}`)
    }
    return instance(props, propName, componentName)
  }

  instance.args = (contentType instanceof Object)
    ? contentType
    : {contentType}

  return taggablePrimitive(instance, 'contentConfig')
}

// The basic JSON.stringify function ignores functions
// but functions can have properties, just like any other object
// this implementation exposes the properties of functions (while still ignoring their source)
function _stringify (v) {
  return (v instanceof Array)
    ? `[${v.map(_stringify).join(',')}]`
    : (v instanceof Object)
      ? `{${
        Object.keys(v)
          .filter(k => !['isRequired', 'tag'].includes(k))
          .filter(k => v[k] !== undefined)
          .map(k => `"${k}":${_stringify(v[k])}`)
          .join(',')
      }}`
      : JSON.stringify(v)
}
FusionPropTypes.stringify = function stringify (v, r, s) {
  const str = _stringify(v)
  return (str)
    ? JSON.stringify(JSON.parse(str), r, s)
    : str
}

module.exports = FusionPropTypes
