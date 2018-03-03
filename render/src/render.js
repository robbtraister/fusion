#!/usr/bin/env node

'use strict'

const ReactDOM = require('react-dom/server')

const compile = require('./compile')

const render = function render (rendering, props) {
  const component = compile(rendering)

  const render = () => ReactDOM.renderToStaticMarkup(component(props))

  // render once without feature content
  const html = render()

  return Promise.resolve(html)
}

module.exports = render

if (module === require.main) {
  const input = (process.argv.length > 2)
    ? Promise.resolve(require(process.argv[2]))
    : new Promise((resolve, reject) => {
      let data = ''
      process.stdin.on('data', (chunk) => {
        data += chunk
      })
      process.stdin.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    })

  input
    .then((rendering) => render(rendering))
    .then(console.log)
    .catch(console.error)
}
