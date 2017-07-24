'use strict'

const url = require('url')

const debug = require('debug')(`fusion:routers:template:${process.pid}`)

const Templates = require('../controllers/templates')

function router () {
  return function templateMiddleware (req, res, next) {
    let uri = url.parse(req.query.uri || req.path).pathname
    debug('Template URI:', uri)

    let templateName = Templates.resolve(uri)
    debug('Template Name:', templateName)

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    res.redirect(302, `/_/assets/templates/${templateName.toLowerCase()}.js`)
  }
}

module.exports = router
module.exports.router = router
