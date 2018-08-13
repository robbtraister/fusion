'use strict'

const request = require('request-promise-native')

const url = require('url')

const debugFetch = require('debug')('fusion:content:sources:fetch')
const debugTimer = require('debug')('fusion:timer:sources:fetch')
const timer = require('../timer')

const {
  cacheProxy,
  cachePrefix
} = require('../../environment')

function pushToCache (cacheKey, cacheValue) {
  const options = {
    method: 'POST',
    uri: cacheProxy + `?key=` + cacheKey,
    body: cacheValue
  }
  return request(options)
}

module.exports = function fetchContent (contentBase, contentUri) {
  const cacheKey = cachePrefix + '_' + contentUri
  const cacheProxyRequest = cacheProxy + `?key=` + cacheKey
  debugFetch(`cache fetching with request  ${JSON.stringify(cacheProxyRequest)}`)
  let tic = timer.tic()

  return request(cacheProxyRequest)
    .then((data) => {
      if (!data) {
        throw Error('data error from cache')
      }
      debugTimer(`Fetch from cache ${cacheKey}`, tic.toc())
      return data
    })
    .catch(() => {
      debugFetch(`Fetching from source` + url.format(Object.assign(url.parse(contentUri), {auth: null})))
      tic = timer.tic()
      const contentUrl = url.resolve(contentBase, contentUri)
      const dataPromise = request(contentUrl)
        .then((data) => {
          debugTimer(`Fetched from source ${cacheKey}`, tic.toc())
          tic = timer.tic()
          return pushToCache(cacheKey, data)
            .then(response => {
              debugTimer(`Pushed to cache`, tic.toc())
              if (response) {
                return data
              }
            })
        })
      return dataPromise
    })
}
