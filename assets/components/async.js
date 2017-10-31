'use strict'

var count = 0

module.exports = function (data) {
  if (typeof window !== 'undefined') {
    const domId = `${data.name}-${count}`
    count += 1

    window.fetch(data.hash.uri)
      .then(data => data.json())
      .then(json => {
        document.getElementById(domId).innerHTML = json.content
      })

    return `<span id="${domId}"></span>`
  } else {
    return ''
  }
}
