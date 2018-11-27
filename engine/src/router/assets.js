'use strict'

const path = require('path')

const bodyParser = require('body-parser')
const express = require('express')

const { getRendering } = require('../io')
const { bodyLimit, defaultOutputType, deployment, distRoot } = require('../../environment')

function deploymentSpecificStaticHandler (dir) {
  const useStatic = express.static(dir)
  return (req, res, next) => {
    if (deployment.test(req.originalUrl)) {
      useStatic(req, res, next)
    } else {
      res.redirect(deployment(req.originalUrl))
    }
  }
}

const distRouter = express.Router()

distRouter.use('/page', deploymentSpecificStaticHandler(path.resolve(distRoot, 'page')))
distRouter.use('/template', deploymentSpecificStaticHandler(path.resolve(distRoot, 'template')))

distRouter.all(
  '/:type(page|template)/:id/:outputType.js',
  bodyParser.json({ limit: bodyLimit }),
  bodyParser.urlencoded({ extended: true }),
  async (req, res, next) => {
    try {
      const type = req.params.type
      const id = req.params.id
      const outputType = req.params.outputType || defaultOutputType

      // const rendering = req.body.rendering || { id, type }

      res.set('Content-Type', 'application/javascript')
      res.set('Cache-Control', 's-max-age=120')

      req.app.render(
        // this file isn't used, but must exist to trigger the appropriate rendering engine
        path.resolve(__dirname, '../engines/jsx/compile/template.jsx-js'),
        Object.assign(
          {
            type,
            id,
            outputType,
            rendering: await getRendering({ type, id })
          }
        ),
        (err, compilation) => {
          if (err) {
            next(err)
          } else {
            res.send(compilation.script)
          }
        }
      )
    } catch (err) {
      next(err)
    }
  }
)

distRouter.use(deploymentSpecificStaticHandler(path.resolve(distRoot)))

module.exports = distRouter
