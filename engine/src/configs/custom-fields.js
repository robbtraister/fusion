'use strict'

const path = require('path')

const PropTypes = require('../react/shared/prop-types')
const unpack = require('../utils/unpack')

const {
  bundleRoot
} = require('../../environment')

function getCustomFields (componentConfig) {
  const customFields = Object.values(componentConfig.outputTypes)
    .reduce((compilation, item) => {
      const componentPath = path.join(bundleRoot, item.dist)
      // ensure we load the latest version of the files
      delete require.cache[componentPath]
      const Component = unpack(require(componentPath))
      const customFields = Component.propTypes && Component.propTypes.customFields
      if (customFields) {
        if (!(customFields instanceof Object)) {
          throw new Error(`${componentConfig.type}/${componentConfig.id}: propTypes.customFields must be an Object`)
        }
        if (customFields.type !== 'shape') {
          throw new Error(`${componentConfig.type}/${componentConfig.id}: propTypes.customFields must be a shape`)
        }

        const args = customFields.args
        const stringified = PropTypes.stringify(args)
        if (!compilation) {
          return {
            root: stringified,
            args: Object.assign(...Object.keys(args).map(k => ({[k]: PropTypes.stringify(args[k])})))
          }
        }
        if (compilation.root && compilation.root === stringified) {
          return compilation
        }

        Object.keys(args)
          .forEach(k => {
            const stringified = PropTypes.stringify(args[k])
            if (k in compilation.args) {
              if (compilation.args[k] !== stringified) {
                throw new Error(`${componentConfig.type}/${componentConfig.id}: propTypes.customFields.${k} has conflicts`)
              }
            } else {
              compilation.args[k] = stringified
              // we have edited the list of args, so we can no longer compare to root
              compilation.root = false
            }
          })
      }
      return compilation
    }, null)

  return (!customFields)
    ? null
    : (customFields.root)
      ? JSON.parse(customFields.root)
      : Object.assign(
        ...Object.keys(customFields.args).sort()
          .map(k => ({
            [k]: JSON.parse(customFields.args[k])
          }))
      )
}

module.exports = getCustomFields
