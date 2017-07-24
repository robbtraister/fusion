'use strict'

const url = require('url')

const debug = require('debug')(`fusion:controllers:resolver:${process.pid}`)

function resolve (uri) {
  return {
    contentURI: contentURI(uri),
    engine: engine(uri),
    templateName: templateName(uri)
  }
}

function contentURI (uri) {
  let p = url.parse(uri).pathname.replace(/^\//, '').replace(/\.js(onp?)?$/, '')
  debug('content path:', p)
  return `${p || 'homepage'}`
}

function engine (uri) {
  // let t = Templates.load(templateName(uri))
  return /^\/section(\/|$)/.test(uri) ? 'vue' : 'react'
}

function templateName (uri) {
  let templateName = 'Article'
  debug('template uri:', uri)
  if (/^\/(homepage\/?)?$/i.test(uri.replace(/\.html?$/, ''))) {
    templateName = 'Homepage'
  } else if (/^\/section(\/|$)/.test(uri)) {
    templateName = 'Section'
  }
  debug('template name:', templateName)
  return templateName
}

module.exports = resolve
module.exports.contentURI = contentURI
module.exports.engine = engine
module.exports.resolve = resolve
module.exports.templateName = templateName

// const Templates = require('./templates')
