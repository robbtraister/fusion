'use strict'

const request = require('request-promise-native')

const url = require('url')

const debugFetch = require('debug')('fusion:content:sources:fetch')
const debugTimer = require('debug')('fusion:timer:sources:fetch')
const timer = require('../timer')

const crypto = require('crypto')

const {
  contentBase,
  cacheProxy,
  cachePrefix
} = require('../../environment')

const resolveCacheRequestUri = (key) => {
  return url.format(`${cacheProxy}?key=${getCacheKey(key)}`)
}

function getCacheKey (key) {
  const cacheKey = `${cachePrefix}_${url.format(Object.assign(url.parse(url.resolve(contentBase, key)), {auth: null}))}`
  console.log(cacheKey)
  return crypto.createHash('DSA-SHA1').update(cacheKey).digest('hex')
}

function pushToCache (key, value) {
  const options = {
    method: 'PUT',
    uri: resolveCacheRequestUri(key),
    body: value
  }
  return request(options)
}

const clearContent = (key) => {
  const options = {
    method: 'DELETE',
    uri: resolveCacheRequestUri(key)
  }
  return request(options)
}

const fetchContent = (key) => {
  let tic = timer.tic()

  return request(resolveCacheRequestUri(key))
    .then((data) => {
      if (!data) {
        throw Error('data error from cache')
      }
      debugTimer(`Fetch from cache ${key}`, tic.toc())
      return data
    })
    .catch(() => {
      debugFetch(`Fetching from source` + url.format(Object.assign(url.parse(key), {auth: null})))
      tic = timer.tic()
      const contentUrl = url.resolve(contentBase, key)
      const dataPromise = request(contentUrl)
        .then((data) => {
          debugTimer(`Fetched from source ${key}`, tic.toc())
          pushToCache(key, data)
          return data
        })
      return dataPromise
    })
}

module.exports = {
  fetchContent,
  clearContent
}
