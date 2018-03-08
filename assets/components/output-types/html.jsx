'use strict'

const React = require('react')

const Layout = (Template) => (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
    </head>
    <body>
      <div id='App'>
        <Template {...props} />
      </div>
    </body>
  </html>

module.exports = Layout
