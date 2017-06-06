const ReactDOM = require('react-dom')
const App = require('./app')

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

var script = document.createElement('script')
script.src = '/content' + page + '.jsonp?m=PbRender'
document.head.appendChild(script)

module.exports = PbRender
