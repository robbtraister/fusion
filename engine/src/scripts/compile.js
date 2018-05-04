'use strict'

const pack = require('../react/server/compile/pack')

const {
  getOutputType
} = require('./info')

const {
  pushFile
} = require('./io')

const {
  outputTypes
} = require('../../environment')

const {
  findRenderableItem
} = require('../models/renderings')

const pushJson = function pushJson ({name, rendering}) {
  return pushFile(`${name}/rendering.json`, JSON.stringify(rendering), 'application/json')
}

const compileScript = function compileScript ({name, rendering, outputType, child, useComponentLib}) {
  outputType = getOutputType(outputType)

  const renderable = (child)
    ? findRenderableItem(rendering)(child)
    : rendering

  return pack({renderable, outputType, useComponentLib})
    .then(({src, css, cssFile}) => {
      const cssPath = cssFile ? `${name}/${cssFile}` : null
      src = src.replace(/;*$/, `;Fusion.Template.cssFile=${cssPath ? `'${cssPath}'` : 'null'}`)

      rendering.css = rendering.css || {}
      rendering.css[outputType] = cssPath

      return (
        (name && !child && !useComponentLib)
          ? Promise.all([
            cssFile ? pushFile(cssPath, css, 'text/css') : Promise.resolve(),
            pushFile(`${name}/${outputType}.js`, src, 'application/javascript')
          ])
          : Promise.resolve()
      )
        .then(() => ({src, css, cssFile}))
    })
}

const compileOne = function compileOne ({name, rendering, outputType, child, useComponentLib}) {
  return compileScript({name, rendering, outputType, child, useComponentLib})
    .then((result) => pushJson({name, rendering}).then(() => result))
}

const compileAll = function compileAll ({name, rendering}) {
  return Promise.all(outputTypes.map((outputType) => compileScript({name, rendering, outputType})))
    .then((result) => pushJson({name, rendering}).then(() => result))
}

module.exports = {
  compileAll,
  compileOne
}
