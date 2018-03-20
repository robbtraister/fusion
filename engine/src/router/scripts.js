'use strict'

const bodyParser = require('body-parser')
const express = require('express')

// const debugTimer = require('debug')('fusion:timer:router')

// const timer = require('../timer')

const {
  getPageByName,
  getTemplateByName
} = require('../renderings')

const {
  compile
} = require('../resources')

const renderRouter = express.Router()

function getTypeRouter (fetchByName) {
  const typeRouter = express.Router()

  typeRouter.all(['/:name'],
    bodyParser.json(),
    (req, res, next) => {
      // const tic = timer.tic()
      const payload = Object.assign(
        {
          name: req.params.name.replace(/\.js$/, '')
        },
        req.body
      )

      fetchByName(payload.name)
        .then(({pt, rendering}) => compile(pt, rendering))
        .then((src) => { res.send(src) })
        .catch(next)
    }
  )

  return typeRouter
}

renderRouter.use('/pages', getTypeRouter(getPageByName))
renderRouter.use('/templates', getTypeRouter(getTemplateByName))

module.exports = renderRouter
