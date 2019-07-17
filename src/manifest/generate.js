'use strict'

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const unpack = require('../utils/unpack')

const { generatedRoot } = require('../../env')

function getComponentSource (manifest) {
  const {
    components: { 'output-types': outputTypes, ...components }
  } = manifest

  return `'use strict'

${unpack}

const components = {
${Object.keys(components)
  .map(collection => {
    return `  '${collection}': {
${Object.keys(components[collection])
  .map(
    type => `    '${type}': unpack(require('${components[collection][type]}'))`
  )
  .join(',\n')}
  }`
  })
  .join(',\n')}
}

if (typeof window !== 'undefined') {
  window.Fusion = window.Fusion || {}
  Fusion.components = components
}

module.exports = components
`
}

function getOutputTypeSource (manifest) {
  const {
    components: { 'output-types': outputTypes }
  } = manifest

  return `'use strict'

${unpack}

const outputTypes = {
${Object.keys(outputTypes)
  .map(type => `  '${type}': unpack(require('${outputTypes[type]}'))`)
  .join(',\n')}
}

module.exports = outputTypes
`
}

function generate (manifest) {
  execSync(`mkdir -p '${generatedRoot}'`)

  fs.writeFileSync(
    path.join(generatedRoot, 'components.js'),
    getComponentSource(manifest)
  )
  fs.writeFileSync(
    path.join(generatedRoot, 'output-types.js'),
    getOutputTypeSource(manifest)
  )
}

module.exports = generate

if (module === require.main) {
  generate(require('.')())
}
