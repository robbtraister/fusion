'use strict'

async function getTree (template) {
  return require(`../../trees/${template}`)
}

module.exports = getTree
