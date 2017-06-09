'use strict'

function Fetcher (fetchContent, fetchLayout) {
  return function (src) {
    let contents = {}

    function getContent (src) {
      if (contents[src]) {
        return
      }

      contents[src] = true
      var fetch = fetchContent(src)
        .then(function (content) {
          contents[src] = content
          return content
        })

      return fetch
    }

    function getLayoutContent (elements) {
      return [].concat.apply([], elements.map(function (element) {
        if (element.children) {
          return getLayoutContent(element.children)
        } else if (element.source) {
          return getContent(element.source)
        }
      }))
    }

    return Promise.all([
      fetchLayout(src)
        .then(function (layout) {
          return Promise.all(getLayoutContent(layout))
            .then(function () { return layout })
        }),
      getContent(src)
        .then(function (data) {
          contents._default = data
        })
    ])
      .then(function (data) {
        return {
          layout: data.shift(),
          contents
        }
      })
  }
}

module.exports = Fetcher
module.exports.Fetcher = Fetcher
