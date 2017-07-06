'use strict'

const fs = require('fs')

const debug = require('debug')(`fusion:controllers:templates:${process.pid}`)

const request = require('request-promise-native')

// Components/Templates bundles do not include react lib; must expose it globally
global.react = require('react')
global.fetch = (uri) => {
  return request({
    uri: `http://localhost:8080${uri}`,
    json: true
  })
    .then(data => {
      return {
        json () {
          return data
        }
      }
    })
}

const Templates = {}
const templateWatchers = {}

function loadTemplate (p, name) {
  debug('(re)loading', p)
  delete require.cache[p]
  global.Templates = require(p)
  Templates[name] = global.Templates[name]
}

function load (name) {
  let p = require.resolve(`../../../templates/${name.toLowerCase()}`)

  if (!templateWatchers.hasOwnProperty(p)) {
    loadTemplate(p, name)
    templateWatchers[p] = fs.watch(p, () => loadTemplate(p, name))
  }

  return Templates[name]
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
