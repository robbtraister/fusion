'use strict'

const React = require('react')
const ReactDOM = require('react-dom')

const Provider = require('./provider')
const fetcher = require('./fetcher')

require('../render')((Template, props) => {
  ReactDOM.render(
    <Provider fetch={fetcher().fetch} uri={window.location.pathname + window.location.search}>
      <Template {...props} />
    </Provider>,
    document.getElementById('App')
  )
})

window.react = React
