'use strict'

const url = require('url')

const request = require('request-promise-native')

const getSource = require('./sources')

const contentBase = process.env.CONTENT_BASE

const fetch = function fetch (sourceName, ...args) {
  const source = getSource(sourceName)

  const fetchKey = function fetchKey (key) {
    const uri = (source.uri instanceof Function)
      ? source.uri(key)
      : source.uri

    return request(url.resolve(contentBase, uri))
  }

  return (args.length === 0)
    ? fetchKey
    : fetchKey(...args)
}

module.exports = fetch

if (module === require.main) {
  fetch(...process.argv.slice(2))
    .then(console.log)
    .catch(console.error)
}
