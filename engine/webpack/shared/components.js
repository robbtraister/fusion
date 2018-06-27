'use strict'

const path = require('path')

const glob = require('glob')

const {
  componentSrcRoot
} = require('../../environment')

const isTest = require('./is-test')
const outputTypes = require('./output-types')

const outputTypeNames = ['index'].concat(Object.keys(outputTypes))

const extensions = ['hbs', 'js', 'jsx', 'vue']

const wildcardLevels = {
  chains: 1,
  features: 2,
  layouts: 1
}

module.exports = Object.assign({},
  ...Object.keys(wildcardLevels)
    .map(type => {
      const componentTypeRoot = `${componentSrcRoot}/${type}`
      const wildcardLevel = wildcardLevels[type]
      const files = [].concat(
        glob.sync(`${componentTypeRoot}${'/*'.repeat(wildcardLevel)}.{${extensions.join(',')}}`),
        glob.sync(`${componentTypeRoot}${'/*'.repeat(wildcardLevel)}/{${outputTypeNames.join(',')}}.{${extensions.join(',')}}`)
      ).filter(f => !isTest(f))

      const components = {}
      files.forEach(fp => {
        const relative = path.relative(componentTypeRoot, fp)
        const parts = path.parse(relative)
        const segments = parts.dir.split('/').concat(parts.name).filter(s => s)
        const name = segments.slice(0, wildcardLevel).join('/')
        const outputType = segments.slice(wildcardLevel).join('/') || 'default'
        components[name] = components[name] || {}
        components[name][outputType] = fp
      })

      return {[type]: components}
    })
)
