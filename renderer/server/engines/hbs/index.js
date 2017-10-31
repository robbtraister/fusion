'use strict'

// module.exports = require('express-handlebars')

const debug = require('debug')('server:engines:hbs')

const path = require('path')

const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    return require(fp)
  }

module.exports = options => (templateFile, data, cb) => {
  try {
    debug('template file:', templateFile)
    debug('data:', data)

    const fn = load(templateFile)
    const body = fn(data)

    const layoutName = data.layout === undefined ? options.defaultLayout : data.layout
    debug('layout name:', layoutName)

    const page = layoutName
      ? (() => {
        const viewsDir = data.settings && data.settings.views
        const layoutFile = path.join(options.layoutsDir || viewsDir || '.', `${layoutName}.hbs`)
        debug('layout file:', layoutFile)
        const layout = load(layoutFile)

        return layout(Object.assign({}, data, {body}))
      })()
      : body

    cb(null, page)
  } catch (e) {
    cb(e)
  }
}
