'use strict'

const fs = require('fs')
const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')

// const debugTimer = require('debug')('fusion:timer:router')

const { distRoot } = require('../environment')
// const timer = require('../timer')

const {
  getPageByName,
  getRendering,
  getTemplateByName
} = require('../models/renderings')

const {
  compile,
  getScriptPrefix,
  uploadScript
} = require('../scripts')

const scriptsRouter = express.Router()

// support dynamic field name since the value is possibly read from POST'ed body
function getTypeRouter (fetchRendering, field = 'name') {
  const typeRouter = express.Router()

  typeRouter.all(['/:name'],
    bodyParser.json(),
    (req, res, next) => {
      // const tic = timer.tic()
      const payload = Object.assign(
        {
          [field]: req.params.name.replace(/\.js$/, '')
        },
        req.body
      )

      const useComponentLib = req.query.useComponentLib === 'true'

      fetchRendering(payload[field])
        .then(({pt, rendering}) => compile({pt, rendering, useComponentLib}))
        .then((src) => { res.set('Content-Type', 'application/javascript').send(src) })
        .catch(next)
    }
  )

  return typeRouter
}

scriptsRouter.use('/page', getTypeRouter(getPageByName))
scriptsRouter.use('/rendering', getTypeRouter(getRendering, 'id'))
scriptsRouter.use('/template', getTypeRouter(getTemplateByName))

scriptsRouter.all('*', (req, res, next) => {
  const pathname = url.parse(req.url).pathname
  fs.readFile(`${distRoot}${pathname}`, (err, src) => {
    err
      ? next(err)
      : Promise.all([
        // return the script source
        res.set('Content-Type', 'application/javascript').send(src),
        // but also upload to s3 so we don't have to use the lambda next time
        uploadScript(`${getScriptPrefix()}${pathname}`, src)
      ])
        .catch(next)
  })
})

module.exports = scriptsRouter
