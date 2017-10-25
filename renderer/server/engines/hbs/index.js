'use strict'

const path = require('path')

const precompiledEngine = options => (fp, data, cb) => {
  const Component = require(fp)
  const body = Component(data)

  const layoutName = (data.layout || options.defaultLayout)
  if (layoutName) {
    const viewsDir = data.settings && data.settings.views
    const Layout = require(path.join(options.layoutsDir || viewsDir || '.', `${layoutName}.hbs`))
    cb(null, Layout(Object.assign({}, data, {body})))
  } else {
    cb(null, body)
  }
}

module.exports = /^prod/i.test(process.env.NODE_ENV)
  ? precompiledEngine
  : require('express-handlebars')
