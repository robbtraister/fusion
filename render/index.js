/* global XMLHttpRequest */

import ReactDOM from 'react-dom'
import App from './app'

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

function PbRender (layout) {
  ReactDOM.render(App({layout: layout}), document.getElementById('App'))
}

var page = document.location.pathname
  // strip trailing / or .htm/.html
  .replace(/(\/|\.html?)$/, '')
  // if it's empty, use `/homepage`
  .replace(/^$/, '/homepage')

var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
  if (this.readyState === 4 && this.status === 200) {
    PbRender(JSON.parse(this.responseText))
  }
}
xhr.open('GET', '/content' + page + '.json', true)
xhr.send()
