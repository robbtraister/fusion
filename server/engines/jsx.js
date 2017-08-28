'use strict'

const path = require('path')

// Components/Templates bundles do not include react lib; must expose it globally
global.react = require('react')
const renderer = require('react-dom/server')

module.exports = options => function (fp, data, cb) {
  try {
    const template = require(path.resolve(fp))

    const layout = (data.layout || options.defaultLayout)
    let rendering = null
    if (layout) {
      const viewsDir = data.settings && data.settings.views
      const layoutTemplate = require(path.resolve(path.join(options.layoutsDir || viewsDir || '.', `${layout}.jsx`)))
      rendering = layoutTemplate(template)(data)
    } else {
      rendering = template(data)
    }

    cb(null, `<!DOCTYPE html>${renderer.renderToStaticMarkup(rendering)}`)
  } catch (e) {
    cb(e)
  }
}
