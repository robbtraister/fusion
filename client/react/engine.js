'use strict'

/* global Template, window */

const React = require('react')
const ReactDOM = require('react-dom')

const Provider = require('./provider')
const fetcher = require('./fetcher')()

window.render = props => {
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
    noscript.parentElement.innerHTML += noscript.innerText
  }
}

window.react = React
