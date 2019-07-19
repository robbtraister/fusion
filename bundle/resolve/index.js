'use strict'

const patterns = [
  {
    pattern: /^\/?sports\/?$/,
    template: 'sports'
  },
  {
    pattern: /.*/,
    template: 'abc'
  }
]

function resolve (uri) {
  let match
  let template
  patterns.find(thisPattern => {
    template = thisPattern.template
    match = thisPattern.pattern.exec(uri)
    return match
  })

  if (match) {
    let tree
    try {
      tree = require(`./trees/${template}`)
    } catch (_) {}

    return {
      template,
      tree
    }
  }
}

module.exports = resolve
