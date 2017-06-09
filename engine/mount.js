'use strict'

/* global window, XMLHttpRequest */

const ReactDOM = require('react-dom')
const Engine = require('.')
// const $ = require('jquery')

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

function getJSON (uri) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var response = xhr.responseText
        if (xhr.status === 200) {
          try {
            return resolve(JSON.parse(response))
          } catch (e) {
            response = e
          }
        }
        reject(response)
      }
    }
    xhr.open('GET', uri, true)
    xhr.send()
  })
}

function normalize (src) {
  return src
    // strip trailing / or .htm/.html
    .replace(/(\/|\.html?)$/, '')
    // strip leading slash
    .replace(/^\/+/, '') || 'homepage'
}

function fetchContent (src) {
  return getJSON('/_content/' + normalize(src) + '.json')
}

function fetchLayout (src) {
  return getJSON('/_layouts/' + normalize(src) + '.json')
}

var fetcher = Engine.Fetcher(fetchContent, fetchLayout)
fetcher(document.location.pathname)
  .then(function (props) {
    var engine = Engine(window.Components)
    ReactDOM.render(engine(props), document.getElementById('App'))
  })
  .catch(console.error)

module.exports = require('react')
