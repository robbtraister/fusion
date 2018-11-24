'use strict'

const path = require('path')

const bodyParser = require('body-parser')
const express = require('express')
const glob = require('glob')

function outputTypeFactory (bundleRoot, defaultOutputType) {
  const outputTypeMap = {}
  glob.sync(path.resolve(bundleRoot, 'components', 'output-types', '*.{hbs,js,jsx}'))
    .forEach((outputTypePath) => {
      const outputTypeParts = path.parse(outputTypePath)
      outputTypeMap[outputTypeParts.base] = outputTypeParts.base
      outputTypeMap[outputTypeParts.name] = outputTypeParts.base
    })

  return (outputType) => outputTypeMap[outputType || defaultOutputType] || `${defaultOutputType}.jsx`
}

module.exports = (env) => {
  const { bodyLimit, bundleRoot, defaultOutputType, getRendering } = env

  const getOutputType = outputTypeFactory(bundleRoot, defaultOutputType)

  const renderRouter = express.Router()

  renderRouter.post(
    '*',
    bodyParser.json({ limit: bodyLimit || '100mb' }),
    bodyParser.urlencoded({ extended: true })
  )

  renderRouter.use(
    async (req, res, next) => {
      req.verifyAuthentication('READ')

      const rendering = await getRendering(req.body && req.body.rendering)

      const outputTypeFile = getOutputType(req.query.outputType || defaultOutputType)

      res.render(
        outputTypeFile,
        {
          arcSite: req.arcSite,
          globalContent: req.body.content.document,
          isAdmin: /^true$/i.test(req.query.isAdmin),
          outputType: path.parse(outputTypeFile).name,
          rendering,
          template: 'template/article'
        }
      )
    }
  )

  return renderRouter
}
