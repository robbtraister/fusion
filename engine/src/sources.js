'use strict'

const sourcesRoot = process.env.SOURCES_ROOT || '../assets/content/sources'

const sources = {}
const getSource = function getSource (sourceName) {
  if (!(sourceName in sources)) {
    sources[sourceName] = require(`${sourcesRoot}/${sourceName}`)
  }
  return sources[sourceName]
}

module.exports = getSource
