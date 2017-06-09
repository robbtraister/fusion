
function Fetcher (fetchContent, fetchLayout) {
  return function (src) {
    let contents = {}

    function getContent (src) {
      if (contents[src]) {
        return contents[src]
      }

      contents[src] = true
      var fetch = fetchContent(src)
        .then(function (content) {
          contents[src] = content
          return content
        })

      return fetch
    }

    return Promise.all([
      fetchLayout(src)
        .then(function (layout) {
          function contentSources (elements) {
            return [].concat.apply([], elements.map(function (element) {
              if (element.children) {
                return contentSources(element.children)
              } else if (element.content) {
                return getContent(element.content)
              }
            }))
          }

          return Promise.all(contentSources(layout))
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
