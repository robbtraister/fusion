'use strict'

const url = require('url')

const debug = require('debug')(`fusion:controllers:resolver:${process.pid}`)

function resolve (uri) {
  return {
    content: content(uri),
    template: template(uri)
  }
}

function content (uri) {
  let p = url.parse(uri).pathname.replace(/^\//, '').replace(/\.js(onp?)?$/, '')
  debug('content path:', p)
  return `${p || 'homepage'}`
}

function template (uri) {
  let templateName = 'Article'
  debug('template uri:', uri)
  if (/^\/(homepage\/?)?$/i.test(uri.replace(/\.html?$/, ''))) {
    templateName = 'Homepage'
  }
  debug('template name:', templateName)
  return templateName
}

module.exports = resolve
module.exports.content = content
module.exports.template = template
