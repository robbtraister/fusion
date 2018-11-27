'use strict'

const path = require('path')

const bodyParser = require('body-parser')
const express = require('express')
const glob = require('glob')

const { getContentSource } = require('../content')
const { getRendering, putHtml } = require('../io')

const { bodyLimit, bundleRoot, defaultOutputType } = require('../../environment')

const outputTypeMap = {}
glob.sync(path.resolve(bundleRoot, 'components', 'output-types', '*.{hbs,js,jsx}'))
  .forEach((outputTypePath) => {
    const outputTypeParts = path.parse(outputTypePath)
    outputTypeMap[outputTypeParts.base] = outputTypeParts.base
    outputTypeMap[outputTypeParts.name] = outputTypeParts.base
  })

function getOutputType (outputType) {
  return outputTypeMap[outputType || defaultOutputType] || `${defaultOutputType}.jsx`
}

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
    const { content, rendering: renderingInfo, request } = body

    const isAdmin = /^true$/i.test(req.query.isAdmin)
    const cacheMode = req.get('Fusion-Cache-Mode')
    const writeToCache = !isAdmin && /^(allowed|preferr?ed|update)$/i.test(cacheMode)
    const outputTypeFile = getOutputType(req.query.outputType || defaultOutputType)

    const rendering = await getRendering(renderingInfo)
    const { data: globalContent, expires } = await getGlobalContent({ content, globalContentConfig: rendering.globalContentConfig })

    req.app.render(
      outputTypeFile,
      {
        arcSite: req.arcSite,
        globalContent,
        isAdmin,
        outputType: path.parse(outputTypeFile).name,
        rendering,
        requestUri: (request && request.uri) || '',
        template: `${rendering.type}/${rendering.id}`
      },
      (err, html) => {
        if (err) {
          next(err)
        } else {
          if (writeToCache) {
            putHtml(req.url, html)
          }

          if (expires) {
            res.set('Expires', new Date(expires).toUTCString())
          }
          res.set('Content-Type', 'text/html')
          res.send(html)
        }
      }
    )
  }
)

module.exports = renderRouter
