'use strict'

const fusionTagFactory = require('./fusion')
const libsTagFactory = require('./libs')
const metaTagsFactory = require('./metas')
const styleTagsFactory = require('./styles')

module.exports = (env) => {
  const getFusionTag = fusionTagFactory(env)
  const getLibsTag = libsTagFactory(env)
  const getMetaTags = metaTagsFactory(env)
  const getStyleTags = styleTagsFactory(env)

  return (context) =>
    Object.assign(
      {},
      getFusionTag(context),
      getLibsTag(context),
      getMetaTags(context),
      getStyleTags(context)
    )
}
