'use strict'

const glob = require('glob')

const {
  componentSrcRoot
} = require('../../environment')

const isTest = require('./is-test')
const outputTypes = require('./output-types')

const outputTypeNames = ['index'].concat(Object.keys(outputTypes))

const extensions = ['hbs', 'js', 'jsx', 'vue']

module.exports = [].concat(
  glob.sync(`${componentSrcRoot}/{chains,layouts}/*.{${extensions.join(',')}}`),
  glob.sync(`${componentSrcRoot}/{chains,layouts}/*/{${outputTypeNames.join(',')}}.{${extensions.join(',')}}`),
  glob.sync(`${componentSrcRoot}/features/*/*.{${extensions.join(',')}}`),
  glob.sync(`${componentSrcRoot}/features/*/*/{${outputTypeNames.join(',')}}.{${extensions.join(',')}}`)
)
  .filter(f => !isTest(f))
