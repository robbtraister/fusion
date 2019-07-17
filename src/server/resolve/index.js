'use strict'

const path = require('path')

const compile = require('../compile')

const {
  distRoot
} = require('../../../env')

const getTemplateStyleHash = (template) => require(path.join(distRoot, 'templates', `${template}.css`)).styleHash

async function resolve (template) {
  const tree = require(`../../trees/${template}`)

  let styleHash = null
  try {
    styleHash = getTemplateStyleHash(template)
  } catch (_) {
    await compile({ template, tree })
    styleHash = getTemplateStyleHash(template)
  }

  return {
    styleHash,
    template,
    tree
  }
}

module.exports = resolve
