'use strict'

/* global Template */

const React = require('react')
const ReactDOM = require('react-dom')

const Provider = require('./provider')
const fetcher = require('./fetcher')()

window.render = props => {
  ReactDOM.render(
    <Provider fetch={fetcher.fetch}>
      <Template {...props} />
    </Provider>,
    document.getElementById('App')
  )
}

window.notFound = () => {
  const noscript = document.getElementById('404')
  if (noscript) {
    document.body.innerHTML = noscript.innerText
  }
}

window.react = React
