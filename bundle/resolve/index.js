'use strict'

const patterns = [
  {
    pattern: /^\/?sports\/?$/,
    template: 'sports'
  },
  {
    pattern: /^\/?body\/?$/,
    template: 'body'
  },
  {
    pattern: /^\/?header\/?$/,
    template: 'header'
  },
  {
    pattern: /.*/,
    template: 'abc'
  }
]

function getTree (template) {
  try {
    return require(`./trees/${template}`)
  } catch (_) {}
}

function resolve (uri) {
  let match
  let template
  patterns.find(thisPattern => {
    template = thisPattern.template
    match = thisPattern.pattern.exec(uri)
    return match
  })

  if (match) {
    const tree = getTree(template)

    return {
      template,
      tree
    }
  }
}

module.exports = resolve
module.exports.getTree = getTree
module.exports.resolve = resolve
