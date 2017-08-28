'use strict'

const path = require('path')

// Components/Templates bundles do not include react lib; must expose it globally
const React = global.react = require('react')
const E = React.createElement
const renderer = require('react-dom/server')

const fetcher = require('./fetcher')
const Provider = require('./provider')

const Wrapper = Component => props => E(Provider, fetcher(), E(Component, props, null))

const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    return require(fp)
  }

module.exports = options => function (fp, data, cb) {
  try {
    const Template = Wrapper(load(fp))

    const layout = (data.layout || options.defaultLayout)
    let rendering = null
    if (layout) {
      const viewsDir = data.settings && data.settings.views
      const layoutTemplate = load(path.join(options.layoutsDir || viewsDir || '.', `${layout}.jsx`))
      rendering = layoutTemplate(Template)(data)
    } else {
      rendering = Template(data)
    }

    cb(null, `<!DOCTYPE html>${renderer.renderToStaticMarkup(rendering)}`)
  } catch (e) {
    cb(e)
  }
}
