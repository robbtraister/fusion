'use strict'

const renderer = require('vue-server-renderer').createRenderer()

function render (rendering) {
  return new Promise((resolve, reject) => {
    let Component = rendering.component
    renderer.renderToString(new Component({data: rendering.content}), (err, html) => {
      if (err) {
        return reject(err)
      }
      resolve(html)
    })
  })
}

module.exports = render
