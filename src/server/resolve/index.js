'use strict'

const path = require('path')

const getTree = require('./tree')
const compile = require('../compile')

const {
  defaultOutputType,
  distRoot
} = require('../../../env')

const getTemplateStyleHash = (template) => require(path.join(distRoot, 'templates', `${template}.css`)).styleHash

async function resolve (uri) {
  const outputType = defaultOutputType
  const template = 'abc'
  const tree = await getTree(template)

  let styleHash = null
  try {
    styleHash = getTemplateStyleHash(template)
  } catch (_) {
    await compile({ template, tree })
    styleHash = getTemplateStyleHash(template)
  }

  return {
    outputType,
    styleHash,
    template,
    tree
  }
}

module.exports = resolve
