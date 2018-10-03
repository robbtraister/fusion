'use strict'

const PropTypes = require('../../../../node_modules/prop-types')

const { taggable } = require('./taggables')

const FusionPropTypes = Object.assign(
  ...Object.keys(PropTypes)
    .map(key => ({
      [key]: ['PropTypes', 'checkPropTypes'].includes(key)
        ? undefined // PropTypes[key]
        : taggable(PropTypes[key], key)
    })),
  require('./custom-types')
)

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
