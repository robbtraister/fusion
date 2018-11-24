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
  const { bodyLimit, bundleRoot, defaultOutputType, getContentSource, getRendering } = env

  const getOutputType = outputTypeFactory(bundleRoot, defaultOutputType)

  async function getGlobalContent ({ content, globalContentConfig }) {
    const globalContent = (!content)
      ? undefined
      : (content.hasOwnProperty('data'))
        ? content.data
        : content.document

    if (globalContent !== undefined) {
      if (content.expires) {
        // we already have all of the information
        return {
          data: globalContent,
          expires: content.expires
        }
      } else {
        // we have the data, but no expiration
        const source = globalContentConfig &&
          globalContentConfig.contentService &&
          getContentSource(globalContentConfig.contentService)

        const expires = (source)
          //  calculate an expiration based on content source TTL
          ? source.getExpiration()
          // default to 10min
          : +new Date() + (600 * 1000)

        return {
          data: globalContent,
          expires
        }
      }
    } else if (globalContentConfig) {
      // fetch data
      const { contentService, contentConfigValues } = globalContentConfig
      return getContentSource(contentService).fetch(contentConfigValues)
    } else {
      // no data and no config
      return {}
    }
  }

  const renderRouter = express.Router()

  renderRouter.post(
    '*',
    bodyParser.json({ limit: bodyLimit || '100mb' }),
    bodyParser.urlencoded({ extended: true })
  )

  renderRouter.use(
    async (req, res, next) => {
      const body = req.body || {}

      const outputTypeFile = getOutputType(req.query.outputType || defaultOutputType)

      const rendering = await getRendering(body.rendering)

      const { data: globalContent, expires } = await getGlobalContent({ content: body.content, globalContentConfig: rendering.globalContentConfig })
      if (expires) {
        res.set('Expires', new Date(expires).toUTCString())
      }
      res.set('Content-Type', 'text/html')

      res.render(
        outputTypeFile,
        {
          arcSite: req.arcSite,
          globalContent,
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
