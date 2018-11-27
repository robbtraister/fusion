'use strict'

const path = require('path')

const {
  readFile
} = require('../../utils/promises')

const { distRoot } = require('../../../environment')

module.exports = {
  async getOutputTypeStyles (outputType) {
    try {
      return await readFile(path.resolve(distRoot, 'components', 'output-types', `${outputType}.css`))
    } catch (err) {}
  }
}
