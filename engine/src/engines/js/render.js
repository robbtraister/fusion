'use strict'

const path = require('path')

const JsLoader = require('./loader')

const getFallbacks = require('../_shared/fallbacks')

const unpack = require('../_shared/unpack')

const { buildRoot } = require('../../../environment')

module.exports = (ext) => {
  return function renderJs (outputTypePath, props, callback) {
    try {
      delete props.settings
      delete props.cache
      delete props._locals

      const OutputType = unpack(require(outputTypePath))

      const loader = new JsLoader({
        componentRoot: path.resolve(buildRoot, 'components'),
        ext,
        outputTypes: getFallbacks({
          ext,
          outputType: props.outputType
        })
      })

      const children = loader.createElement(props.tree)

      const data = OutputType({
        ...props,
        children
      })

      callback(
        null,
        {
          contentType: OutputType.contentType,
          data
        }
      )
    } catch (err) {
      callback(err)
    }
  }
}
