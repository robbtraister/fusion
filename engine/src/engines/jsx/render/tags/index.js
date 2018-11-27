'use strict'

const getFusionTag = require('./fusion')
const getLibsTag = require('./libs')
const getMetaTags = require('./metas')
const getStyleTags = require('./styles')

module.exports = (context) =>
  Object.assign(
    {},
    getFusionTag(context),
    getLibsTag(context),
    getMetaTags(context),
    getStyleTags(context)
  )
