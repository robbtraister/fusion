'use strict'

const React = require('react')

const Layout = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.scripts}
      <link rel='icon' type='image/x-icon' href='https://resources.arcpublishing.com/marketing/favicon.ico' />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
    </body>
  </html>

module.exports = Layout
