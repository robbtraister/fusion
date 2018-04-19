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
  uploadScript
} = require('../scripts')

const distRouter = express.Router()

// support dynamic field name since the value is possibly read from POST'ed body
function getTypeRouter (fetchRendering, field = 'name') {
  const typeRouter = express.Router()

  typeRouter.get(['/:name.js'],
    bodyParser.json(),
    (req, res, next) => {
      // const tic = timer.tic()
      const payload = Object.assign(
        {
          [field]: req.params.name
        },
        req.body
      )

      const outputType = req.query.outputType
      const useComponentLib = req.query.useComponentLib === 'true'

      fetchRendering(payload[field])
        .then(({pt, rendering}) => compile({pt, rendering, outputType, useComponentLib}))
        .then((src) => { res.set('Content-Type', 'application/javascript').send(src) })
        .catch(next)
    }
  )

  return typeRouter
}

distRouter.use('/page', getTypeRouter(getPageByName))
distRouter.use('/rendering', getTypeRouter(getRendering, 'id'))
distRouter.use('/template', getTypeRouter(getTemplateByName))

distRouter.get('*', (req, res, next) => {
  const pathname = url.parse(req.url).pathname
  fs.readFile(`${distRoot}${pathname}`, (err, src) => {
    err
      ? next(err)
      : Promise.all([
        // return the script source
        res.set('Content-Type', 'application/javascript').send(src),
        // but also upload to s3 so we don't have to use the lambda next time
        uploadScript(pathname, src)
      ])
        .catch(next)
  })
})

module.exports = distRouter
