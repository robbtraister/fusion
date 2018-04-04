'use strict'

const React = require('react')

const Layout = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.scripts}
      <link rel='icon' type='image/x-icon' href='/pb/resources/favicon.ico' />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
      {props.fusion}
    </body>
  </html>

module.exports = Layout
