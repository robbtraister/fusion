'use strict'

const request = require('request-promise-native')

const url = require('url')

const debugFetch = require('debug')('fusion:content:sources:fetch')
const debugTimer = require('debug')('fusion:timer:sources:fetch')
const timer = require('../../timer')

const crypto = require('crypto')

const {
  contentBase,
  cacheProxyUrl,
  cachePrefix
} = require('../../../environment')

function getCacheKey (uri) {
  const hash = crypto.createHash('sha256').update(uri).digest('hex')
  return `${cachePrefix}:${hash}`
}

function sanitizeUri (uri) {
  const uriParts = url.parse(uri)
  return (uriParts.auth)
    ? url.format(Object.assign(uriParts, {auth: `${uriParts.auth.split(':').shift()}:<redacted>`}))
    : uri
}

function formatUri (uri) {
  const resolvedUri = url.resolve(contentBase, uri)
  const sanitizedUri = sanitizeUri(resolvedUri)
  const cacheKey = getCacheKey(sanitizedUri)
  debugFetch(`cache key: ${sanitizedUri} => ${cacheKey}`)

  return {
    cacheKey,
    resolvedUri,
    sanitizedUri
  }
}

function makeCacheRequest ({method, key, value}) {
  return (cacheProxyUrl)
    ? request(
      Object.assign(
        {
          method: method || 'GET',
          uri: `${cacheProxyUrl}?key=${key}`
        },
        // don't depend on existence of value, since you might want to push null/undefined
        (method === 'PUT')
          ? {body: value}
          : {}
      )
    )
    : Promise.resolve()
}

const clearContent = (key) => makeCacheRequest({key, method: 'DELETE'})
const fetchContent = (key) => makeCacheRequest({key})
const pushContent = (key, value) => makeCacheRequest({key, value, method: 'PUT'})

const fetch = (uri, forceSync) => {
  let tic = timer.tic()

  const { cacheKey, resolvedUri, sanitizedUri } = formatUri(uri)

  function fetchFromSource () {
    debugFetch(`Fetching from source [${sanitizedUri}]`)
    tic = timer.tic()

    return request(resolvedUri)
      .then((data) => {
        debugTimer(`Fetched from source [${sanitizedUri}]`, tic.toc())
        return pushContent(cacheKey, data)
          .then(() => data)
      })
  }

  return (cacheProxyUrl && forceSync !== true)
    ? Promise.resolve()
      .then(() => {
        debugFetch(`Fetching from cache [${sanitizedUri}]`)

        return fetchContent(cacheKey)
          .then((data) => {
            if (!data) {
              throw new Error('data error from cache')
            }
            debugTimer(`Fetched from cache [${sanitizedUri}]`, tic.toc())
            return data
          })
          .catch(fetchFromSource)
      })
    : fetchFromSource()
}

module.exports = {
  fetch,
  clear: (uri) => clearContent(formatUri(uri).cacheKey)
}