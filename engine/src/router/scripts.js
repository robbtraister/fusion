'use strict'

const fs = require('fs')

const bodyParser = require('body-parser')
const express = require('express')

// const debugTimer = require('debug')('fusion:timer:router')

// const timer = require('../timer')

const {
  getPageByName,
  getRendering,
  getTemplateByName
} = require('../renderings')

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

      fetchRendering(payload[field])
        .then(({pt, rendering}) => compile(pt, rendering))
        .then((src) => { res.send(src) })
        .catch(next)
    }
  )

  return typeRouter
}

scriptsRouter.all('/engine/*', (req, res, next) => {
  fs.readFile(`${__dirname}/../../dist${req.url}`, (err, src) => {
    err
      ? next(err)
      : Promise.all([
        // return the script source
        res.send(src),
        // but also upload to s3 so we don't have to use the lambda next time
        uploadScript(`${getScriptPrefix()}${req.url}`, src)
      ])
        .catch(next)
  })
})

scriptsRouter.use('/page', getTypeRouter(getPageByName))
scriptsRouter.use('/rendering', getTypeRouter(getRendering, 'id'))
scriptsRouter.use('/template', getTypeRouter(getTemplateByName))

module.exports = scriptsRouter
