'use strict'

const request = require('request-promise-native')

const getSource = require('./sources')

const fetch = function fetch (sourceName, ...args) {
  const source = getSource(sourceName)

  const fetchKey = function fetchKey (key) {
    const uri = (source.uri instanceof Function)
      ? source.uri(key)
      : source.uri

    return request(uri)
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
