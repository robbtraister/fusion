'use strict'

const path = require('path')

const getTree = require('./tree')
const compile = require('../compile')

const {
  defaultOutputType,
  distRoot
} = require('../../../env')

const getTemplateStyleHash = ({ outputType, template }) => require(path.join(distRoot, 'templates', template, `${outputType}.css`)).styleHash

async function resolve (uri) {
  const outputType = defaultOutputType
  const template = 'abc'
  const tree = await getTree(template)

  let styleHash = null
  try {
    styleHash = getTemplateStyleHash({ outputType, template })
  } catch (_) {
    await compile({ outputType, template, tree })
    styleHash = getTemplateStyleHash({ outputType, template })
  }

  return {
    outputType,
    styleHash,
    template,
    tree
  }
}

module.exports = resolve
