'use strict'

const React = require('react')

const OutputType = (props) =>
  <html>
    <head>
      <title>Fusion Rendering</title>
      {props.metaTag}
      {props.libs}
      {props.cssLink}
      <link rel='icon' type='image/x-icon' href='/pb/resources/favicon.ico' />
    </head>
    <body>
      <div id='App'>
        {props.children}
      </div>
      {props.fusion}
    </body>
  </html>

module.exports = OutputType
