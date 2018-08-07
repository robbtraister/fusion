'use strict'

const request = require('request-promise-native')

const url = require('url')

const debugFetch = require('debug')('fusion:content:sources:fetch')

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
  console.log(`fetching from url ${JSON.stringify(contentUri)}`)

  const cacheKey = cachePrefix + '_' + contentUri
  const cacheProxyRequest = cacheProxy + `?key=` + cacheKey
  debugFetch(`cache fetching with request  ${JSON.stringify(cacheProxyRequest)}`)

  return request(cacheProxyRequest)
    .then((data) => {
      if (!data) {
        throw Error('data error from cache')
      }
      console.log(`cache value found for key: ` + cacheKey)
      return data
    })
    .catch(() => {
      debugFetch(`Fetching from source` + url.format(Object.assign(url.parse(contentUri), {auth: null})))
      const contentUrl = url.resolve(contentBase, contentUri)
      const dataPromise = request(contentUrl)
        .then((data) => {
          debugFetch(`Pushing to cache` + cacheKey)
          return pushToCache(cacheKey, data)
            .then(response => {
              if (response) {
                return data
              }
            })
        })
      return dataPromise
    })
}
