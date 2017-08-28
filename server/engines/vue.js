'use strict'

const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()

module.exports = options => (fp, data, cb) => {
  const render = require(fp).default.render
  const v = new Vue({
    render,
    data
  })
  renderer.renderToString(v, (err, html) => {
    err ? cb(err) : cb(null, `<!DOCTYPE html>${html}`)
  })
}
