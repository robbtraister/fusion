'use strict'

/* global Templates */

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

const React = require('react')
const ReactDOM = require('react-dom')

// require consumer so that it is compiled and available for client components
require('../../content/consumer')
const fetcher = require('../../content/fetcher')
const Provider = require('../../content/provider')

window.render = function (props) {
  ReactDOM.render(
    <Provider fetch={fetcher}>
      <Templates.default {...props} />
    </Provider>,
    document.getElementById('App')
  )
}

// expose react lib for Components
module.exports = React
