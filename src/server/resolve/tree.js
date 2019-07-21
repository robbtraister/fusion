'use strict'

const path = require('path')

const {
  bundleRoot
} = require('../../../env')

async function getTree (template) {
  return require(path.join(bundleRoot, 'resolve', 'trees', template))
}

module.exports = getTree
