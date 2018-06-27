'use strict'

const glob = require('glob')

const {
  componentSrcRoot
} = require('../../environment')

const isTest = require('./is-test')
const outputTypes = require('./output-types')

const outputTypeNames = ['index'].concat(Object.keys(outputTypes))

const extensions = ['hbs', 'js', 'jsx', 'vue']

const wildcards = {
  chains: '*',
  features: '*/*',
  layouts: '*'
}

module.exports = Object.assign({},
  ...Object.keys(wildcards)
    .map(type => {
      const wildcard = wildcards[type]
      return {[type]: [].concat(
        glob.sync(`${componentSrcRoot}/${type}/${wildcard}.{${extensions.join(',')}}`),
        glob.sync(`${componentSrcRoot}/${type}/${wildcard}/{${outputTypeNames.join(',')}}.{${extensions.join(',')}}`)
      ).filter(f => !isTest(f))}
    })
)
