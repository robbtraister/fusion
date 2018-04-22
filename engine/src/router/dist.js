'use strict'

const fs = require('fs')

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
  fs.readFile(`${distRoot}${req.path.replace(/\.js$/, '')}/${getOutputType(req.query.outputType)}.js`, (err, src) => {
    err
      ? next()
      : res.set('Content-Type', 'application/javascript').send(src)
  })
})

distRouter.all(/\.css$/, (req, res, next) => {
  fs.readFile(`${distRoot}${req.path}`, (err, src) => {
    err
      ? next()
      : res.set('Content-Type', 'text/css').send(src)
  })
})

// support dynamic field name since the value is possibly read from POST'ed body
function getTypeRouter (type) {
  const fetchType = fetchRendering(type)

  const typeRouter = express.Router()

  typeRouter.all('/:id.js',
    bodyParser.json(),
    (req, res, next) => {
      const id = req.params.id
      // const tic = timer.tic()
      const payload = Object.assign(
        {id},
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

distRouter.use('/page', getTypeRouter('page'))
distRouter.use('/rendering', getTypeRouter('rendering'))
distRouter.use('/template', getTypeRouter('template'))

module.exports = distRouter
