'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const bodyParser = require('body-parser')
const express = require('express')

// const debugTimer = require('debug')('fusion:timer:router')

const { distRoot } = require('../environment')
// const timer = require('../timer')

const {
  compile,
  fetchRendering
} = require('../scripts')

const {
  getOutputType
} = require('../scripts/info')

const distRouter = express.Router()

distRouter.use('/engine', express.static(`${__dirname}/../../dist/engine`))

// if POSTed, we will re-generate
distRouter.get(/\.js$/, (req, res, next) => {
  const pathname = url.parse(req.url).pathname
  const parts = path.parse(pathname)
  fs.readFile(`${distRoot}${parts.dir}/${parts.name}/${getOutputType(req.query.outputType)}.js`, (err, src) => {
    err
      ? next()
      : res.set('Content-Type', 'application/javascript').send(src)
  })
})

distRouter.all(/\.css$/, (req, res, next) => {
  const pathname = url.parse(req.url).pathname
  fs.readFile(`${distRoot}${pathname}`, (err, src) => {
    err
      ? next()
      : res.set('Content-Type', 'text/css').send(src)
  })
})

// support dynamic field name since the value is possibly read from POST'ed body
function getTypeRouter (type, field = 'id') {
  const fetchType = fetchRendering(type)

  const typeRouter = express.Router()

  typeRouter.all(/\.js$/,
    bodyParser.json(),
    (req, res, next) => {
      const id = req.path.replace(/^\/+/, '').replace(/\.js$/, '')
      // const tic = timer.tic()
      const payload = Object.assign(
        {
          [field]: id
        },
        req.body
      )

      const outputType = req.query.outputType
      const useComponentLib = req.query.useComponentLib === 'true'

      // if (isDev && !useComponentLib) {
      //   src += `;Fusion.Template.css=\`${css.replace('`', '\\`')}\``
      // }
      const name = type === 'rendering' ? null : `${type}/${id}`

      fetchType(payload)
        .then(({rendering}) => compile({name, rendering, outputType, useComponentLib}))
        .then((src) => { res.set('Content-Type', 'application/javascript').send(src) })
        .catch(next)
    }
  )

  return typeRouter
}

distRouter.use('/page', getTypeRouter('page', 'uri'))
distRouter.use('/rendering', getTypeRouter('rendering'))
distRouter.use('/template', getTypeRouter('template'))

module.exports = distRouter
