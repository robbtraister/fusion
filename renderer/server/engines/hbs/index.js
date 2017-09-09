'use strict'

// module.exports = require('express-handlebars')

// if templates are pre-compiled...

const path = require('path')

const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    return require(fp)
  }

module.exports = options => (fp, data, cb) => {
  const Component = load(fp)
  const body = Component(data)

  const layoutName = (data.layout || options.defaultLayout)
  if (layoutName) {
    const viewsDir = data.settings && data.settings.views
    const Layout = load(path.join(options.layoutsDir || viewsDir || '.', `${layoutName}.hbs`))
    cb(null, Layout(Object.assign({}, data, {body})))
  } else {
    cb(null, body)
  }
}
