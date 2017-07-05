'use strict'

const fs = require('fs')

const debug = require('debug')(`fusion:templates:${process.pid}`)

// Components/Templates bundles do not include react lib; must expose it globally
global.react = require('react')

const Templates = {}
const templateWatchers = {}

function loadTemplate (p) {
  debug('(re)loading', p)
  delete require.cache[p]
  require(p)
  Object.keys(global.Templates)
    .filter(k => k !== 'default')
    .forEach(t => { Templates[t] = global.Templates[t] })
}

function load (name) {
  return new Promise((resolve, reject) => {
    let p = require.resolve(`../../dist/templates/${name.toLowerCase()}`)

    if (!templateWatchers.hasOwnProperty(p)) {
      loadTemplate(p)
      templateWatchers[p] = fs.watch(p, () => loadTemplate(p))
    }
    resolve(Templates[name])
  })
}

function resolve (uri) {
  let templateName = 'Article'
  if (/^\/(homepage\/?)?$/i.test(uri.replace(/\.html?$/, ''))) {
    templateName = 'Homepage'
  }
  debug('template name:', templateName)
  return templateName
}

module.exports = resolve
module.exports.load = load
module.exports.resolve = resolve
