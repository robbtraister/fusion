'use strict'

const PropTypes = require('../../../../node_modules/prop-types')

const { taggable } = require('./taggables')

const isPropTypeSelfRef = (key) => ['PropTypes', 'checkPropTypes'].includes(key)
const isPropTypeMethod = (key) => ['isRequired', 'tag'].includes(key)

const ignorePropTypeSelfRefs = (key) => !isPropTypeSelfRef(key)
const ignorePropTypeMethods = (key) => !isPropTypeMethod(key)

const FusionPropTypes = Object.assign(
  ...Object.keys(PropTypes)
    .filter(ignorePropTypeSelfRefs)
    .map(key => ({ [key]: taggable(PropTypes[key], key) })),
  require('./custom-types')
)

// The basic JSON.stringify function ignores functions
// but functions can have properties, just like any other object
// this implementation exposes the properties of functions (while still ignoring their source)
function _stringify (value) {
  const exists = (key) => value[key] !== undefined

  return (value instanceof Array)
    ? `[${value.map(_stringify).join(',')}]`
    : (value instanceof Object)
      ? `{${
        Object.keys(value)
          .filter(ignorePropTypeMethods)
          .filter(exists)
          .map(key => `"${key}":${_stringify(value[key])}`)
          .join(',')
      }}`
      : JSON.stringify(value)
}
FusionPropTypes.stringify = function stringify (value, replacer, space) {
  const str = _stringify(value)
  return (str)
    ? JSON.stringify(JSON.parse(str), replacer, space)
    : str
}

module.exports = FusionPropTypes
