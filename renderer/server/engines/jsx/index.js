'use strict'

const path = require('path')

// Components/Templates bundles do not include react lib; must expose it globally
global.react = require('react')
const renderer = require('react-dom/server')

const Provider = require('./provider')

const manifestFile = templateFile => path.resolve(path.dirname(templateFile), 'manifest.json')

const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    delete require.cache[manifestFile(fp)]
    return require(fp)
  }

const render = component => `<!DOCTYPE html>${renderer.renderToStaticMarkup(component)}`

module.exports = options => {
  return (templateFile, props, cb) => {
    try {
      let Component = Provider(load(templateFile))
      const contentCache = Component.cache

      const manifest = require(manifestFile(templateFile))
      props.cssFile = manifest[`${path.basename(templateFile)}.css`]

      const layoutName = (props.layout || options.defaultLayout)
      if (layoutName) {
        const viewsDir = props.settings && props.settings.views
        const Layout = load(path.join(options.layoutsDir || viewsDir || '.', `${layoutName}.jsx`))
        Component = Layout(Component)
      }

      const component = Component(props)
      const html = render(component)

      const cacheKeys = Object.keys(contentCache)
      if (cacheKeys && cacheKeys.length > 0) {
        Promise.all(cacheKeys.map(k => contentCache[k]))
          .then(() => cb(null, render(component)))
      } else {
        cb(null, html)
      }
    } catch (e) {
      cb(e)
    }
  }
}
