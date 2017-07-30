#!/usr/bin/env node

'use strict'

const url = require('url')

const debug = require('debug')(`fusion:controllers:resolver:${process.pid}`)

function resolve (uri) {
  return {
    contentURI: contentURI(uri),
    templateName: templateName(uri)
  }
}

function contentURI (uri) {
  let p = url.parse(uri).pathname.replace(/^\//, '').replace(/\.js(onp?)?$/, '')
  debug('content path:', p)
  return `${p || 'homepage'}`
}

function templateName (uri) {
  let p = url.parse(uri).pathname.replace(/\.html?$/, '')
  let templateName = 'Article'
  debug('template uri:', uri)
  if (/^\/(homepage\/?)?$/i.test(p)) {
    templateName = 'Homepage'
  } else if (/^\/section(\/|$)/.test(uri)) {
    templateName = 'Section'
  }
  debug('template name:', templateName)
  return templateName
}

module.exports = resolve
module.exports.contentURI = contentURI
module.exports.resolve = resolve
module.exports.templateName = templateName

if (module === require.main) {
  console.log(resolve(process.argv[2]))
}
