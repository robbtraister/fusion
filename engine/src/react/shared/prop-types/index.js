'use strict'

const PropTypes = require('../../../../node_modules/prop-types')

const taggablePrimitive = (propType, typeName, complexArgs, isRequired) => {
  const propTypeCopy = (...args) => propType(...args)

  const isRequiredName = `${typeName}.isRequired`

  propTypeCopy.type = typeName
  propTypeCopy.args = complexArgs

  propTypeCopy.tag = (tags) => {
    const instance = (...args) => propTypeCopy(...args)
    instance.type = typeName
    instance.args = complexArgs
    instance.tags = tags
    if (!isRequired && propType.isRequired) {
      instance.isRequired = (...args) => propType.isRequired(...args)
      instance.isRequired.type = isRequiredName
      instance.isRequired.args = complexArgs
      instance.isRequired.tags = tags
    }
    return instance
  }

  // in production, propType is just a placeholder function, so make sure we aren't recursing infinitely
  if (!isRequired && propType.isRequired) {
    propTypeCopy.isRequired = taggablePrimitive(propType.isRequired, isRequiredName, complexArgs, true)
  }

  return propTypeCopy
}

const taggableComplex = (propType, typeName) => (complexArgs) => {
  // we need to make a new function even for complex types, because in production mode, all types share an empty shim
  const f = (...args) => propType(complexArgs)(...args)
  return taggablePrimitive(f, typeName, complexArgs)
}

const taggable = (propType, typeName) => {
  return (propType.isRequired) // (['shim', 'bound checkType'].includes(propType.name))
    ? taggablePrimitive(propType, typeName)
    : taggableComplex(propType, typeName)
}

const FusionPropTypes = Object.assign(
  ...Object.keys(PropTypes)
    .map(key => ({
      [key]: ['PropTypes', 'checkPropTypes'].includes(key)
        ? PropTypes[key]
        : taggable(PropTypes[key], key)
    }))
)

FusionPropTypes.contentConfig = (options, ...moreSchemas) => {
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

  const args = !(options instanceof Object)
    ? { schemas: [options].concat(...moreSchemas) }
    : (options instanceof Array)
      ? { schemas: options.concat(...moreSchemas) }
      : options

  return taggablePrimitive(instance, 'contentConfig', args)
}

// The basic JSON.stringify function ignores functions
// but functions can have properties, just like any other object
// this implementation exposes the properties of functions (while still ignoring their source)
function _stringify (v, i) {
  return (v instanceof Array)
    ? `[${v.map(_stringify).join(',')}]`
    : (v instanceof Object)
      ? `{${
        Object.keys(v)
          .filter(k => !['isRequired', 'tag'].includes(k))
          .filter(k => v[k] !== undefined)
          .map(k => `"${k}":${_stringify(v[k], (i || 0) + 1)}`)
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
