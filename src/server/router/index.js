'use strict'

const express = require('express')

const assets = require('./assets')
const content = require('./content')
const render = require('./render')
const templates = require('./templates')

function router () {
  let router = express.Router()

  router.use('/_/assets', assets())
  router.use('/_/content', content())
  router.use('/_/templates', templates())
  router.use(render())

  return router
}

module.exports = router
