'use strict'

const PropTypes = require('prop-types')

const taggablePrimitive = (propType, name) => {
  propType.tag = (tags) => {
    const instance = (...args) => propType(...args)
    instance.propType = name
    instance.args = propType.args
    instance.tags = tags
    if (propType.isRequired) {
      instance.isRequired = (...args) => propType.isRequired(...args)
      instance.isRequired.propType = `${name}.isRequired`
      instance.isRequired.args = propType.args
      instance.isRequired.tags = tags
    }
    return instance
  }

  if (propType.isRequired) {
    propType.isRequired.args = propType.args
    taggablePrimitive(propType.isRequired, `${name}.isRequired`)
  }

  return propType
}

const taggableComplex = (propType, name) => (args) => {
  const f = propType(args)
  f.args = args
  return taggablePrimitive(f, name)
}

const taggable = (propType, name) => {
  return (propType.name === 'bound checkType')
    ? taggablePrimitive(propType, name)
    : taggableComplex(propType, name)
}

module.exports = Object.assign(
  ...Object.keys(PropTypes)
    .map(key => ({
      [key]: ['PropTypes', 'checkPropTypes'].includes(key)
        ? PropTypes[key]
        : taggable(PropTypes[key], key)
    }))
)

function _stringify (v) {
  return (v instanceof Object)
    ? `{${
      Object.keys(v)
        .filter(k => k !== 'isRequired')
        .filter(k => v[k] !== undefined)
        .map(k => `"${k}":${_stringify(v[k])}`)
        .join(',')
    }}`
    : JSON.stringify(v)
}
module.exports.stringify = function stringify (v, r, s) {
  return JSON.stringify(JSON.parse(_stringify(v)), r, s)
}
