/* global XMLHttpRequest */

import ReactDOM from 'react-dom'
import App from './app'

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

function getContentSource () {
  var page = document.location.pathname
    // strip trailing / or .htm/.html
    .replace(/(\/|\.html?)$/, '')
    // strip leading slash
    .replace(/^\/+/, '') || 'homepage'

  return '/content/' + page + '.json'
}

var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
  if (this.readyState === 4 && this.status === 200) {
    ReactDOM.render(App({layout: JSON.parse(this.responseText)}), document.getElementById('App'))
  }
}
xhr.open('GET', getContentSource(), true)
xhr.send()
