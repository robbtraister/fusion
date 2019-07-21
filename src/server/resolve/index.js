'use strict'

const path = require('path')

const compile = require('../compile')

const { bundleRoot, defaultOutputType, distRoot } = require('../../../env')

const resolveUri = require(path.join(bundleRoot, 'resolve'))

const getTemplateStyleHash = ({ outputType, template }) =>
  require(path.join(distRoot, 'templates', template, `${outputType}.css`))
    .styleHash

async function resolve (uri, query = {}) {
  const { template, tree } = resolveUri(uri)
  const outputType = query.outputType || defaultOutputType

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
