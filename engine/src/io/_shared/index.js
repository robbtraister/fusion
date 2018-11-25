'use strict'

const path = require('path')

const {
  readFile
} = require('../../utils/promises')

module.exports = (env) => {
  const { distRoot } = env

  return {
    async getOutputTypeStyles (outputType) {
      try {
        return await readFile(path.resolve(distRoot, 'components', 'output-types', `${outputType}.css`))
      } catch (err) {}
    }
  }
}
