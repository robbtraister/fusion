'use strict'

const path = require('path')
const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')
const glob = require('glob')

const { getContentSource } = require('../content')
const { getRendering, putRender } = require('../io')
const { getProperties } = require('../properties')

const getRenderables = require('../engines/_shared/renderables')
const substitute = require('../engines/_shared/substitute')
const getTree = require('../engines/_shared/rendering-to-tree')

const {
  bodyLimit,
  bundleRoot,
  contextPath,
  defaultOutputType,
  deployment
} = require('../../environment')

const HTML_CONTENT_TYPE = 'text/html'

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
  const data = (!content)
    ? undefined
    : (content.hasOwnProperty('data'))
      ? content.data
      : content.document

  if (data !== undefined) {
    const lastModified = content.lastModified || +new Date()

    if (content.expires) {
      // we already have all of the information
      return {
        data,
        expires: content.expires,
        lastModified
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
        data,
        expires,
        lastModified
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

renderRouter.all(['/', '/:type(page|template)/:id', '/:type(page|template)/:id/:child'],
  async (req, res, next) => {
    const body = req.body || {}
    const { content, rendering: renderingInfo, request } = body

    const arcSite = req.arcSite
    const child = req.params.child
    const isAdmin = /^true$/i.test(req.query.isAdmin)
    const cacheMode = req.get('Fusion-Cache-Mode')
    const writeToCache = !isAdmin && /^(allowed|preferr?ed|update)$/i.test(cacheMode)
    const outputTypeFile = getOutputType(req.query.outputType)
    const outputType = path.parse(outputTypeFile).name
    const requestUri = (request && request.uri) || ''

    const rendering = await getRendering(
      Object.assign(
        {
          type: req.params.type,
          id: req.params.id
        },
        renderingInfo
      )
    )
    const globalContentConfig = rendering.globalContentConfig
    const { data: globalContent, expires } = await getGlobalContent({ content, globalContentConfig })

    const props = {
      arcSite,
      contextPath,
      deployment,
      globalContent,
      globalContentConfig,
      isAdmin,
      layout: rendering.layout,
      outputType,
      requestUri,
      siteProperties: getProperties(arcSite),
      template: `${rendering.type}/${rendering.id}`
    }
    const hydratedRendering = substitute(
      rendering,
      {
        ...props,
        // legacy API for hydration used `content.` to reference globalContent
        content: props.globalContent
      }
    )

    props.metas = hydratedRendering.meta || {}
    props.metaValue = (name) => {
      const meta = props.metas[name]
      return meta && meta.value
    }

    props.tree = getTree({ outputType, rendering })
    props.renderables = getRenderables(props.tree)
    if (child) {
      props.child = props.renderables.find((renderable) => renderable.props.id === child)
    }

    req.app.render(
      outputTypeFile,
      props,
      async (err, result) => {
        if (err) {
          next(err)
        } else {
          result = result || {}
          const contentType = result.contentType || HTML_CONTENT_TYPE
          const data = (contentType === HTML_CONTENT_TYPE && !props.child)
            ? `<!DOCTYPE html>${result.data}`
            : result.data

          if (writeToCache && requestUri) {
            const filePath = url.parse(requestUri).pathname.replace(/\/$/, '/index.html')
            const cacheKey = path.join(arcSite || 'default', outputType, filePath)
            await putRender(cacheKey, data, contentType)
          }

          if (expires) {
            res.set('Expires', new Date(expires).toUTCString())
          }
          res.set('Content-Type', contentType)
          res.send(data)
        }
      }
    )
  }
)

module.exports = renderRouter
