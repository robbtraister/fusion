'use strict'

const debug = require('debug')(`fusion:templates:${process.pid}`)

function get (uri) {
  let template = 'Article'
  if (/^\/(homepage\/?)?$/i.test(uri)) {
    template = 'Homepage'
  }
  debug('template:', template)
  return template
}

module.exports = get
module.exports.get = get
