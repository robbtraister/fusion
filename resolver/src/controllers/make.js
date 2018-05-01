'use strict'

const resolve = require('./resolve')
const engine = require('./engine')

const endpoint = function endpoint (data, outputType, arcSite) {
  const query = outputType ? `?outputType=${outputType}` : ''
  const arcSiteParam = arcSite && outputType ? `&_website=${arcSite}` : `?_website=${arcSite}`
  return `/render/${data.type}${query}${arcSiteParam}`
}

const make = function make (uri, outputType, version, arcSite) {
  return resolve(uri, arcSite)
    .then((data) => engine({
      method: 'POST',
      uri: endpoint(data, outputType, arcSite),
      data,
      version
    }))
}

module.exports = make
