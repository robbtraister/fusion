'use strict'

const React = require('react')

const Layout = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.scripts}
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
    </body>
  </html>

module.exports = Layout
