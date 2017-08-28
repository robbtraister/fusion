'use strict'

/* global Template */

const React = require('react')
const ReactDOM = require('react-dom')

window.render = props => {
  ReactDOM.render(
    <Template {...props} />,
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
