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

var contents = {}

function fetchContent (src) {
  var normalizedSource = '/_content/' + normalize(src) + '.json'
  if (contents[normalizedSource]) {
    return contents[normalizedSource]
  }

  var fetch = getJSON(normalizedSource)
    .then(function (content) {
      contents[normalizedSource] = content
      return content
    })
  contents[normalizedSource] = contents[normalizedSource] || fetch
  return fetch
}

function getContent (src) {
  if (contents[src]) {
    return contents[src]
  }

  var fetch = fetchContent(src)
    .then(function (content) {
      contents[src] = content
      return content
    })
  contents[src] = contents[src] || fetch
  return fetch
}

function fetchLayout (src) {
  var normalizedSource = '/_layout/' + normalize(src) + '.json'
  return getJSON(normalizedSource)
}

const page = document.location.pathname

Promise.all([
  fetchLayout(page)
    .then(function (layout) {
      function collect (elements) {
        elements.forEach(function (element) {
          if (element.children) {
            collect(element.children)
          } else if (element.content) {
            if (!contents.hasOwnProperty(element.content)) {
              contents[element.content] = false
            }
          }
        })
      }

      collect(layout)

      return Promise.all(Object.keys(contents).map(getContent))
        .then(function () { return layout })
    }),
  getContent(page)
    .then(function (data) {
      contents._default = data
    })
])
  .then(function (data) {
    var layout = data.shift()
    var engine = Engine(window.Components)
    ReactDOM.render(engine({contents: contents, layout: layout}), document.getElementById('App'))
  })
  .catch(console.error)

module.exports = require('react')
