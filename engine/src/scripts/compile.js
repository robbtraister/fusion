'use strict'

const pack = require('../react/server/compile/pack')

const {
  getOutputType
} = require('./info')

const {
  pushFile
} = require('./io')

const {
  findRenderableItem
} = require('../models/renderings')

const compileScript = function compileScript ({name, rendering, outputType, child, useComponentLib}) {
  const renderable = (child)
    ? findRenderableItem(rendering)(child)
    : rendering

  return pack({renderable, outputType, useComponentLib})
    .then(({src, css, cssFile}) => {
      const cssPath = cssFile ? `${name}/${cssFile}` : null
      src = src.replace(/;*$/, `;Fusion.Template.cssFile=${cssPath ? `'${cssPath}'` : 'null'}`)
      return (
        (name && !child && !useComponentLib)
          ? Promise.all([
            cssFile ? pushFile(cssPath, css, 'text/css') : Promise.resolve(),
            pushFile(`${name}/${getOutputType(outputType)}.js`, src, 'application/javascript'),
            pushFile(`${name}/${getOutputType(outputType)}.json`, JSON.stringify(Object.assign({}, rendering, {cssFile: cssPath})), 'application/json')
          ])
          : Promise.resolve()
      )
        .then(() => ({src, css, cssFile}))
    })
}

module.exports = {
  compileScript
}
