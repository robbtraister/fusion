'use strict'

const {
  environment,
  prefix,
  version
} = require('../environment')

const getBucket = function getBucket () {
  return 'pagebuilder-fusion'
}

const getKeyBase = function getKeyBase () {
  return `${environment}/${version}`
}

const getOutputType = function getOutputType (outputType) {
  return outputType || 'default'
}

// const getRenderingName = function getRenderingName (pt) {
//   return (pt.uri)
//     ? `page/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}`
//     : `template/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}`
// }

const getRelativeUri = function getRelativeUri ({componentType, id, outputType}) {
  return `/${prefix}/dist/${componentType}/${id}.js?v=${version}&outputType=${getOutputType(outputType)}`
  // return `/${prefix}/dist/${name}.js?v=${version}&outputType=${getOutputType(outputType)}${useComponentLib ? '&useComponentLib=true' : ''}`,
}

const getS3Key = function getS3Key ({componentType, id, outputType}) {
  return `${getKeyBase()}/dist/${componentType}/${id}/${getOutputType(outputType)}.js`
}

const getS3Url = function getS3Url ({componentType, id, outputType}) {
  return `https://${getBucket()}.s3.amazonaws.com/${getS3Key({componentType, id, outputType})})`
}

module.exports = {
  getBucket,
  getKeyBase,
  getOutputType,
  // getRenderingName,
  getRelativeUri,
  getS3Key,
  getS3Url
}
