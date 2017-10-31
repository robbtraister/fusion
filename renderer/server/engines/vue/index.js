'use strict'

const fs = require('fs')
const path = require('path')

const Vue = require('vue')
const createRenderer = require('vue-server-renderer').createRenderer

const debug = require('debug')('server:engines:vue')

// templates are compiled to js, so we can require them
const load = /^prod/i.test(process.env.NODE_ENV)
  ? fp => require(path.resolve(fp))
  : fp => {
    fp = path.resolve(fp)
    delete require.cache[fp]
    return require(fp)
  }

// layouts are templated html, not js, so can't require them
const readFresh = fp => {
  return new Promise((resolve, reject) => {
    fs.readFile(fp, (err, content) => {
      if (err) {
        return reject(err)
      }
      resolve(content.toString())
    })
  })
}

// in production, cache layout files to avoid unnecessary fs reads
const cache = {}
const readCached = fp => {
  cache[fp] = cache[fp] || readFresh(fp)
  return cache[fp]
}

const read = /^prod/i.test(process.env.NODE_ENV) ? readCached : readFresh

module.exports = options => {
  return (templateFile, data, cb) => {
    try {
      debug('template file:', templateFile)
      debug('data:', data)

      const layoutName = data.layout === undefined ? options.defaultLayout : data.layout
      debug('layout name:', layoutName)

      const renderer = layoutName
        ? (() => {
          const viewsDir = data.settings && data.settings.views
          const layoutFile = path.join(options.layoutsDir || viewsDir || '.', `${layoutName}.vue.html`)
          debug('layout file:', layoutFile)

          return read(layoutFile).then(template => createRenderer({ template }))
        })()
        : Promise.resolve(createRenderer())

      renderer.then(renderer => {
        const Template = load(templateFile)

        renderer.renderToString(
          new Vue(Object.assign({}, Template, {data})),
          Object.assign({}, data, {cssFile: Template.cssFile || ''}),
          (err, html) => {
            if (err) {
              return cb(err)
            }
            cb(null, html)
          }
        )
      }).catch(cb)
    } catch (e) {
      cb(e)
    }
  }
}
