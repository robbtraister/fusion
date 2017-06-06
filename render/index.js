import ReactDOM from 'react-dom'

import App from './app'

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

// load JSONP directly in index.html to init request before parsing render engine
ReactDOM.render(App({layout: window.layout}), document.getElementById('App'))
