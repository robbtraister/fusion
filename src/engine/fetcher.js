'use strict'

function Fetcher (fetchContent, fetchLayout) {
  return function fetchAll (src) {
    let contents = {}

    function getContent (src) {
      if (contents[src]) {
        return
      }

      contents[src] = true
      var fetch = fetchContent(src)
        .then(content => {
          contents[src] = content
          return content
        })

      return fetch
    }

    function getLayoutContent (elements) {
      return [].concat.apply([], elements.map(element => {
        if (element.children) {
          return getLayoutContent(element.children)
        } else if (element.source) {
          return getContent(element.source)
        }
      }))
    }

    return Promise.all([
      fetchLayout(src)
        .then(layout => {
          return Promise.all(getLayoutContent(layout))
            .then(() => layout)
        }),
      getContent(src)
        .then(data => { contents._default = data })
    ])
      .then(data => ({
        layout: data.shift(),
        contents
      }))
  }
}

module.exports = Fetcher
module.exports.Fetcher = Fetcher
