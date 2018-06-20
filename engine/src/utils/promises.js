'use strict'

const { promisify } = require('util')

const glob = require('glob')

module.exports = {
  glob: promisify(glob)
}
