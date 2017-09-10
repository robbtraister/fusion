'use strict'

/* global Template, window */

const React = require('react')
const ReactDOM = require('react-dom')

const Provider = require('./provider')
const fetcher = require('./fetcher')()

window.render = props => {
  const templateStyle = document.getElementById('template-style')
  if (Template.cssFile) {
    templateStyle.href = `/_assets/templates/${Template.cssFile}`
  }

  ReactDOM.render(
    <Provider fetch={fetcher.fetch} uri={window.location.pathname + window.location.search}>
      <Template {...props} />
    </Provider>,
    document.getElementById('App')
  )
}

window.notFound = () => {
  const noscript = document.getElementById('404')
  if (noscript) {
    const html = noscript.innerText
    const parent = noscript.parentElement
    parent.removeChild(noscript)
    parent.innerHTML += html
  }
}

window.react = React
