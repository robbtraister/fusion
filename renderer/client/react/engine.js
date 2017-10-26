'use strict'

/* global content, Template, window */

const React = require('react')
const ReactDOM = require('react-dom')

const Provider = require('./provider')
const fetcher = require('./fetcher')

function render (props) {
  const templateStyle = document.getElementById('template-style')
  if (Template.cssFile) {
    templateStyle.href = `/_assets/templates/${Template.cssFile}`
  }

  ReactDOM.render(
    <Provider fetch={fetcher().fetch} uri={window.location.pathname + window.location.search}>
      <Template {...props} />
    </Provider>,
    document.getElementById('App')
  )
}

document.body.onload = () => {
  typeof content === 'undefined' || render(content)
}

require('../not-found')

window.react = React
