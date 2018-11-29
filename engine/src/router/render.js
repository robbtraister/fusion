'use strict'

const path = require('path')
const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')
const glob = require('glob')

const { getContentSource } = require('../content')
const { getRendering, putHtml } = require('../io')

const getRenderables = require('../engines/_shared/renderables')
const substitute = require('../engines/_shared/substitute')
const getTree = require('../engines/_shared/rendering-to-tree')

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

    const arcSite = req.arcSite
    const isAdmin = /^true$/i.test(req.query.isAdmin)
    const cacheMode = req.get('Fusion-Cache-Mode')
    const writeToCache = !isAdmin && /^(allowed|preferr?ed|update)$/i.test(cacheMode)
    const outputTypeFile = getOutputType(req.query.outputType)
    const outputType = path.parse(outputTypeFile).name
    const requestUri = (request && request.uri) || ''

    const rendering = await getRendering(renderingInfo)
    const globalContentConfig = rendering.globalContentConfig
    const { data: globalContent, expires } = await getGlobalContent({ content, globalContentConfig })

    const tree = getTree({ outputType, rendering })
    const props = {
      arcSite,
      globalContent,
      globalContentConfig,
      isAdmin,
      layout: tree.type,
      outputType,
      requestUri,
      template: `${rendering.type}/${rendering.id}`
    }
    props.tree = substitute(tree, props)
    props.renderables = getRenderables(props.tree)

    req.app.render(
      outputTypeFile,
      props,
      async (err, html) => {
        if (err) {
          next(err)
        } else {
          if (writeToCache && requestUri) {
            const filePath = url.parse(requestUri).pathname.replace(/\/$/, '/index.html')
            await putHtml(path.join(arcSite || 'default', outputType, filePath), html)
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
