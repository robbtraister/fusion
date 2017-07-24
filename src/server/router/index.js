'use strict'

const express = require('express')

const assets = require('./assets')
const content = require('./content')
const engine = require('./engine')
const render = require('./render')
const template = require('./template')

function router () {
  let router = express.Router()

  router.use('/_/assets', assets())
  router.use('/_/content', content())
  router.use('/_/engine', engine())
  router.use('/_/template', template())
  router.use(render())

  return router
}

module.exports = router
